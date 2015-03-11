/*!
	psd-reader version 0.2.1 BETA

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
			onLoad     : options.onLoad || options.onload
		};

	this.onload = config.onLoad ? config.onLoad.bind(this) : null;
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
	 * @type {{}}
	 */
	this.info = {};

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
					me._parser(me.buffer);
				},
				function(msg) {
					error(msg, "_fetch")
				})
		}
		else {
			this._parser(this.buffer);
		}

	}
	catch(err) {
		error(err.message, "core");
	}

	// common error handler
	function error(msg, src) {
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

PsdReader._blockSize = 2048 * 1024;
PsdReader._delay = 7;

/*
Uint8Array.prototype.fill = Uint8Array.prototype.fill || function(value, start, end) {
	start = start || 0;
	end = end || this.length;
	var len = end-start;
	if (len > 0) while(len--) this[start++] = value;
};
*/