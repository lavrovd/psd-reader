/*!
	psd-reader version 0.4.0 BETA

	By Epistemex (c) 2015
	www.epistemex.com

	MIT license (this header required)
*/

/**
 * Create a new instance of PSD (Photoshop graphic data file) providing
 * either an URL to a PSD file, or an ArrayBuffer with the file loaded
 * in already. Prove onLoad and onError handlers to handle the
 * asynchronous nature.
 *
 * @param {object} options - option object (required: url or buffer)
 * @param {string} [options.url] - URl to a PSD file (if not URL is provided, a buffer must be)
 * @param {ArrayBuffer} [options.buffer] - ArrayBuffer containing data for a PSD file (if not buffer is provided, an URL must be)
 * @param {function} [options.onLoad] - callback function when image has been loaded and parsed to RGBA. Optionally use `onload`
 * @param {function} [options.onError] - callback function to handle errors. Optionally use `onerror`
 * @param {boolean} [options.crossOrigin] - set to true to request cross-origin use of an external psd file
 * @param {number} [options.gamma=1] - use this gamma for conversion. Note: give inverse value, ie. 1/2.2 etc. 1 = no processing
 * @param {number} [options.gamma32] - use this gamma for 32-bits conversion. Defaults to guessed system value (1/1.8 for Mac, 1/2.2 for others)
 * @param {Array} [options.duotone=[255,255,255]] - color to mix with duotone data, defaults to an array representing RGB for white [255, 255, 255].
 * @param {boolean} [options.passive] - load data but don't parse and decode. use parse() to invoke manually.
 * @constructor
 */
function PsdReader(options) {

	if (typeof options === "string") {
		options = {url: options}
	}
	else
		options = options || {};

	var me = this,
		config = {
			url        : options.url || "",
			buffer     : options.buffer || null,
			crossOrigin: typeof options.crossOrigin == "boolean" ? !!options.crossOrigin : null,
			onError    : options.onError || options.onerror,
			onLoad     : options.onLoad || options.onload,
			onReady    : options.onReady || options.onready,
			gamma	   : +options.gamma || 1,
			gamma32	   : +options.gamma32 || PsdReader.guessGamma(),
			duotone	   : options.duotone || [255, 255, 255],
			passive	   : !!options.passive
		};

	this._cfg = config;

	/**
	 * Indicate if a file has been parsed. Useful with passive mode.
	 * @type {boolean}
	 */
	this.isParsed = false;

	this._isParsing = false;

	/**
	 * onready handler points to a function that will be called once
	 * the file has been loaded or given, but before parsed. Use this
	 * with passive mode when an file is loaded asynchronously.
	 * @type {function|null}
	 */
	this.onready = config.onReady ? config.onReady.bind(this) : null;

	/**
	 * onload handler points to a function that will be called once
	 * the file has been parsed.
	 * @type {function|null}
	 */
	this.onload = config.onLoad ? config.onLoad.bind(this) : null;

	/**
	 * onerror handler points to a function that will be called if any
	 * errors occurs. If not specified the error will be thrown instead.
	 * @type {function|null}
	 */
	this.onerror = config.onError ? config.onError.bind(this) : null;

	/**
	 * Contains the original ArrayBuffer provided as option, or loaded
	 * through XHR.
	 * @type {ArrayBuffer|null}
	 */
	this.buffer = config.buffer ? ArrayBuffer.isView(config.buffer) ? config.buffer.buffer : config.buffer : null;

	/**
	 * Holds the converted PSD as a 8-bit RGBA bitmap compatible with
	 * canvas. The data can be set directly as a bitmap buffer for canvas:
	 *
	 * For example (ctx being the canvas 2D context):
	 *
	 *     var idata = ctx.createImageData(w, h);  // create ImageData buffer
	 *     idata.data.set(psd.rgba);               // set the bitmap as source
	 *     ctx.putImageData(idata, x, y);          // update canvas
	 *
	 * @type {Uint8Array|null}
	 */
	this.rgba = null;

	/**
	 * Information object containing vital header information such
	 * as width, height, depth, byteWidth, channels, bitmaps array,
	 * pseudo chunks (buffer position and length), compression method
	 * and color mode.
	 *
	 * The following properties are public:
	 *
	 * 	{number} width - width of bitmap in pixels
	 * 	{number} height - height of bitmap in pixels
	 *	{number} channels - number of channels (red is one channel, alpha another etc.)
	 *	{number} depth - color depth (1/8/16/32 are valid values, indexed will have depth 8)
	 *	{number} indexes - number of actual indexes used with indexed files
	 *	{number} byteWidth - byte step to iterate a decompressed buffer
	 *	{number} colorMode - color mode value [0,15]
	 *	{string} colorDesc - textual description of color mode
	 *	{number} compression - compression type used (0,1,2,3 are valid values, although 2,3 are very rare, if any)
	 *	{string} compressionDesc - textual description of compression type
	 *	{number} channelSize - number of bytes per channel
	 *	{array} chunks - list of main "chunks". Should total 5.
	 *	{array} bitmaps - array with bitmap data (always uncompressed) in original order.
	 *
	 * @type {object}
	 */
	this.info = {
		width           : 0,	/** @type {number} width of bitmap */
		height          : 0,
		channels        : 0,
		depth           : 0,
		indexes			: 0,
		byteWidth       : 0,
		colorMode       : 0,
		colorDesc       : "",
		compression     : 0,
		compressionDesc : "",
		channelSize     : 0,
		chunks          : [],
		bitmaps         : []
	};

	// check that we have a data source
	if ((!config.url || typeof config.url !== "string" || (config.url && !config.url.length)) && !this.buffer) {
		error("No data buffer or URL is specified.", "core");
		return
	}
	else if (config.url && this.buffer) {
		error("Both URL and a data buffer is specified.", "core");
		return
	}

	this._err = function(msg, src) {error(msg, src)};

	try {
		// invoke loader or parser
		if (config.url) {
			this._fetch(config.url, function(buffer) {
					me.buffer = buffer;
					me.view = new DataView(buffer);
					if (me.onready) me.onready({timeStamp: Date.now()});
					if (!me._cfg.passive) me._parser(me.buffer);
				},
				function(msg) {
					error(msg, "_fetch")
				})
		}
		else {
			if (me.onready) me.onready({timeStamp: Date.now()});
			if (!this._cfg.passive) this._parser(this.buffer);
		}

	}
	catch(err) {
		error(err.message, "core");
	}

	// common error handler
	function error(msg, src) {
		me._isParsing = false;

		if (me.onerror) setTimeout(_err.bind(me), 1);
		else throw new TypeError(msg);

		function _err() {
			me.onerror({
				message: msg,
				source: src,
				timeStamp: Date.now()
			});
		}
	}
}

PsdReader.prototype = {

	parse: function() {
		if (!this.isParsed && !this._isParsing)
			this._parser(this.buffer);
	},

	_fetch: function(url, callback, error) {

		try {
			var xhr = new XMLHttpRequest(),
				me = this;
			xhr.open("GET", url);
			xhr.responseType = "arraybuffer";
			xhr.onerror = function() {me._err("Network error.", "fetch/onerror")};
			xhr.onload = function() {
				if (xhr.status === 200) callback(xhr.response);
				else me.error("Loading error: " + xhr.statusText, "fetch/onload");
			};
			xhr.send();
		}
		catch(err) {this.error(err.message, "fetch/catch")}
	}
};

/**
 * Guess system display gamma. Gives only an approximation. Can be used
 * if display gamma is unknown. Will return (inverse) 1/1.8 for Mac,
 * 1/2.2 for all others.
 * @return {number}
 */
PsdReader.guessGamma = function() {
	return 1 / ((navigator.userAgent.indexOf("Mac OS") > -1) ? 1.8 : 2.2)
};

PsdReader._blockSize = 2048 * 1024;		// async block size
PsdReader._delay = 7;					// async delay in milliseconds

/*
Uint8Array.prototype.fill = Uint8Array.prototype.fill || function(value, start, end) {
	start = start || 0;
	end = end || this.length;
	var len = end-start;
	if (len > 0) while(len--) this[start++] = value;
};
*/