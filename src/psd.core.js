/*!
	psd-reader version 0.5.2 BETA

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
 * @param {string} [options.url] - URl to a PSD file (if not URL is provided, a buffer must be, but never both)
 * @param {ArrayBuffer} [options.buffer] - ArrayBuffer containing data for a PSD file (if not buffer is provided, an URL must be, but never both)
 * @param {function} [options.onLoad] - callback function when image has been loaded and parsed to RGBA. Optionally use `onload`
 * @param {function} [options.onError] - callback function to handle errors. Optionally use `onerror`
 * @param {number} [options.gamma=1] - use this gamma for conversion. Note: give inverse value, ie. 1/2.2 etc. 1 = no processing
 * @param {number} [options.gamma32] - use this gamma for 32-bits conversion. Defaults to guessed system value (1/1.8 for Mac, 1/2.2 for others)
 * @param {Array} [options.duotone=[255,255,255]] - color to mix with duotone data, defaults to an array representing RGB for white [255, 255, 255].
 * @param {boolean} [options.passive=false] - load data but don't parse and decode. use parse() to invoke manually.
 * @param {boolean} [options.ignoreAlpha=false] - ignore alpha channel if any.
 * @param {boolean} [options.noRGBA=false] - do not convert to RGBA format. If you only want to deal with the raw data. Channels are decompressed if needed.
 * @param {boolean} [options.noDematte=false] - do not de-matte images with alpha channels (indexed images are never processed)
 * @constructor
 */
function PsdReader(options) {

	options = options || {};

	var me = this,
		onready,
		config = {
			url        : options.url || "",
			buffer     : options.buffer || null,
			onError    : options.onError || options.onerror,
			onLoad     : options.onLoad || options.onload,
			onReady    : options.onReady || options.onready,
			gamma	   : +options.gamma || 1,
			gamma32	   : +options.gamma32 || PsdReader.guessGamma(),
			duotone	   : options.duotone || [255, 255, 255],
			passive	   : !!options.passive,
			ignoreAlpha: !!options.ignoreAlpha,
			noRGBA	   : !!options.noRGBA,
			noDematte  : !!options.noDematte
		};

	/**
	 * Expose public reference to config for prototyped methods.
	 * @type {*}
	 * @private
	 */
	this._cfg = config;

	/**
	 * Indicate if a file has been parsed. Useful with passive mode.
	 * @type {boolean}
	 */
	this.isParsed = false;

	/**
	 * isParsing -> isp
	 * To lock parse() while waiting for server response when using ajax.
	 * @type {boolean}
	 * @private
	 */
	this._isp = false;

	/**
	 * onready handler points to a function that will be called once
	 * the file has been loaded or given, but before parsed. Use this
	 * with passive mode when an file is loaded asynchronously.
	 * @type {function|null}
	 */
	this.onready = onready = config.onReady ? config.onReady.bind(me) : null;

	/**
	 * onload handler points to a function that will be called once
	 * the file has been parsed.
	 * @type {function|null}
	 */
	this.onload = config.onLoad ? config.onLoad.bind(me) : null;

	/**
	 * onerror handler points to a function that will be called if any
	 * errors occurs. If not specified the error will be thrown instead.
	 * @type {function|null}
	 */
	this.onerror = config.onError ? config.onError.bind(me) : null;

	/**
	 * Contains the original ArrayBuffer provided as option, or loaded
	 * through XHR.
	 * @type {ArrayBuffer|null}
	 */
	this.buffer = config.buffer || null;

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
	 *	{array}  chunks - list of main "chunks". Should total 5.
	 *	{array}  bitmaps - array with bitmap data (always uncompressed) in original order.
	 *
	 * @type {object}
	 */
	this.info = {
		width           : 0,
		height          : 0,
		channels        : 0,
		depth           : 0,
		indexes			: 0,
		hasAlpha		: false,
		byteWidth       : 0,
		colorMode       : 0,
		colorDesc       : "",
		compression     : 0,
		compressionDesc : "",
		channelSize     : 0,
		chunks          : [],
		bitmaps         : []
	};

	/**
	 * Expose reference to common error handler
	 * @private
	 */
	this._err = function(msg, src) {
		me._isp = false;

		if (me.onerror) setTimeout(sendErr.bind(me), 1);
		else throw new TypeError(msg);

		function sendErr() {
			me.onerror({
				message: msg,
				source: src,
				timeStamp: Date.now()
			});
		}
	};

	function _err(msg) {me._err(msg, "core")}

	// check that we have a data source
	if ((!config.url || typeof config.url !== "string" || (config.url && !config.url.length)) && !me.buffer) {
		_err("Buffer nor URL specified");
		return
	}
	else if (config.url && me.buffer) {
		_err("Both URL and buffer specified");
		return
	}

	try {
		// invoke loader or parser
		if (config.url) {
			me._fetch(config.url, function(buffer) {
					me.buffer = buffer;
					me.view = new DataView(buffer);
					if (onready) onready({url: config.url, timeStamp: Date.now()});
					if (!me._cfg.passive) me._parser(me.buffer);
				},
				_err);
		}
		else {
			if (onready) onready({url: null, timeStamp: Date.now()});
			if (!me._cfg.passive) me._parser(me.buffer);
		}
	}
	catch(err) {
		_err(err.message);
	}

}

PsdReader.prototype = {

	/**
	 * Method to invoke parsing of the loaded file when created in
	 * passive mode (see options). If already parsed, or is loading,
	 * the method fails silently.
	 *
	 * Important to note is that the onready event can be used to know
	 * when data can be parsed. When data has been parsed, the onload
	 * event will be called as normal.
	 *
	 * Active mode:
	 *
	 *     var psd = new PsdReader(url: "...", onload: onload);
	 *     function onload(e) { ...done... }
	 *
	 * Passive mode:
	 *
	 *     var psd = new PsdReader(url: "...", passive: true, onready: onready, onload: onload);
	 *     function onready() { psd.parse();   // can be parsed here}
	 *     function onload(e) { ...done... }
	 *
	 */
	parse: function() {
		var me = this;
		if (!me.isParsed && !me._isp)
			me._parser(me.buffer);
	},

	/**
	 * If option noRGBA is used but you want to convert the data to RGBA
	 * later, this method can be called.
	 *
	 * It is **asynchronous** and takes a callback argument. When the conversion
	 * has finished, the instance.rgba property is set with the bitmap and
	 * the callback is given an object containing a reference to the bitmap
	 * (rgba) and a timeStamp. If the conversion was unsuccessful the
	 * rgba property will be null.
	 *
	 * If the image was already converted, the callback is invoked right
	 * away.
	 *
	 * @param {function} callback - required callback function
	 */
	toRGBA: function(callback) {

		var me = this, cb = callback.bind(me);

		if (me._cfg.noRGBA && !me.rgba) {
			me._toRGBA(function(bmp) {
				me.rgba = bmp;
				send();
			});
		}
		else send();

		function send() {cb({rgba: me.rgba, timeStamp: Date.now()})}
	},

	/**
	 * Returns the indexed color table if present, or null. The number of
	 * entries is always 256. The indexed color values are not interleaved,
	 * but hold first the reds, greens then blue. To find number of actual
	 * used indexes, use findResource() with ID 1046 (if converted to RGBA
	 * the number of actual indexes can be found in psd.info.indexes).
	 * @return {Uint8Array|null}
	 */
	getIndexTable: function() {
		var ci = this.info.chunks[1];
		return ci.length ? new Uint8Array(this.buffer, ci.pos, ci.length) : null
	},

	/**
	 * Convert a color index (when indexed mode) to little-endian unsigned
	 * 32-bit integer including full opaque for alpha channel. Can be set
	 * directly on an Uin32Array view for a canvas buffer.
	 * @param {Uint8Array} tbl - the table holding the color indexes
	 * @param {number} index - value from [0, 255]. Max depends on how many indexes the image contains.
	 * @param {boolean} [alpha=false] - if true ANDs out the alpha.
	 * @return {number} unsigned 32-bit integer in little-endian format (ABGR).
	 */
	indexToInt: function(tbl, index, alpha) {
		var v = 0xff000000 + (tbl[index + 512]<<16) + (tbl[index + 256]<<8) + tbl[index];
		return alpha ? v & 0xffffff : v;
	},

	/**
	 * Create a gamma look-up table (LUT) based on the provided inverse gamma.
	 *
	 * @param {number} gamma - inverse gamma (ie. 1/2.2, 1/1.8 etc.)
	 * @return {Uint8ClampedArray}
	 */
	getGammaLUT: function(gamma) {
		var lut = new Uint8ClampedArray(256), i = 0;
		if (gamma === 1) {
			while(i < 256) lut[i] = i++;
		}
		else {
			for(; i < 256; i++) lut[i] = (Math.pow(i / 255, gamma) * 255 + 0.5)|0;
		}
		return lut
	},

	/**
	 * Converts a 32-bit floating point value to integer. It reads the value
	 * from the given channel at position pos.
	 * @param {DataView} channel - channel to read from
	 * @param {number} pos - position to read from
	 * @return {number} converted integer value in the range [0, 255]
	 */
	floatToComp: function(channel, pos) {
		return (channel.getFloat32(pos) * 255)|0
	},

	/**
	 * Load a file as ArrayBuffer through HTTPXML request.
	 * @param {string} url - valid URL to PSD file
	 * @param {function} callback - callback function invoked when loaded
	 * @param {function} error - callback function invoked in case of any error
	 * @private
	 */
	_fetch: function(url, callback, error) {

		var me = this, xhr = new XMLHttpRequest();
		try {
			xhr.open("GET", url);
			xhr.responseType = "arraybuffer";
			xhr.onerror = function() {me._err("Network error", "fetch/err")};
			xhr.onload = function() {
				if (xhr.status === 200) callback(xhr.response);
				else me.error("Loading error: " + xhr.statusText, "fetch/load");
			};
			xhr.send();
		}
		catch(err) {me.error(err.message, "fetch/c")}
	},

	/**
	 * Converts a Uint8Array/view region to DataView for the same region.
	 * @param {*} bmp - a view representing a region of a ArrayBuffer
	 * @return {DataView}
	 * @private
	 */
	_chanToDV: function(bmp) {
		return new DataView(bmp.buffer, bmp.byteOffset, bmp.byteLength);
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
