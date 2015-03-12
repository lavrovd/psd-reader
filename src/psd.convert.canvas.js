/**
 * Converts already loaded and parsed PSD file to canvas. A canvas element
 * is returned with the bitmap at the original size, or null if no RGBA
 * was being produced.
 *
 * Example usage:
 *
 *     function callback(e) {
 *         var canvas = psd.toCanvas();
 *         ...
 *     }
 *
 * @returns {HTMLCanvasElement|null}
 */
PsdReader.prototype.toCanvas = function() {

	//todo add options for scale, HQ scale, ..

	if (!this.rgba) return null;

	var canvas = document.createElement("canvas"),
		ctx = canvas.getContext("2d"),
		idata;

	try {
		canvas.width = this.info.width;
		canvas.height = this.info.height;

		idata = ctx.createImageData(canvas.width, canvas.height);
		idata.data.set(this.rgba);
		ctx.putImageData(idata, 0, 0);
	}
	catch(err) {
		this._err("Could not create canvas", "toCanvas");
	}

	return canvas;
};