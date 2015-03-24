/*
	psd-reader - To canvas
	By Ken Fyrstenberg / Epistemex (c) 2015
	www.epistemex.com
*/

/**
 * Converts already loaded and parsed PSD file to canvas. A canvas element
 * is returned with the bitmap at the original size, or null if no RGBA
 * was being produced.
 *
 * Example usage:
 *
 *     function callback() {
 *         var canvas = psd.toCanvas();
 *         ...
 *     }
 *
 * If a canvas could not be created an error is thrown (memory, size etc.).
 * If the instance wasn't able to decode the PSD file, a null is returned.
 *
 * Note: if the option `noRGBA` was used you need to convert to RGBA first
 * using the (asynchronous) `toRGBA()` method.
 *
 * @param {object} [options] - options
 * @param {number} [options.scale] - Scale factor for both x and y directions, 1 = 100%. If result of size is fraction, the size will be rounded to nearest integer number.
 * @param {boolean} [options.hq=false] - High-quality down-sample. Use if you need large images scaled down to small sizes.
 * @return {HTMLCanvasElement|null}
 */
PsdReader.prototype.toCanvas = function(options) {

	if (!this.rgba) return null;

	options = options || {};

	var me = this,
		canvas = document.createElement("canvas"),
		ctx = canvas.getContext("2d"),
		idata, tcanvas, tctx, steps,
		scale = options.scale || 1,
		hq = !!options.hq,
		w = me.info.width, h = me.info.height, ow, oh,
		sw = (w * scale + 0.5)|0,
		sh = (h * scale + 0.5)|0,
		errMsg = "Could not create canvas";

	// convert RGBA full size to canvas
	try {
		canvas.width = w;
		canvas.height = h;

		idata = ctx.createImageData(w, h);
		idata.data.set(me.rgba);
		ctx.putImageData(idata, 0, 0);
	}
	catch(err) {
		me._err(errMsg, "toCanvas");
	}

	try {
		if (scale !== 1) {  // we can do a manual Lanczo resampling here later.
			tcanvas = document.createElement("canvas");
			tctx = tcanvas.getContext("2d");

			if (hq && sw < w && sh < h) {
				//todo need to be async/block-based...
				w = tcanvas.width = Math.ceil(w * 0.5);
				h = tcanvas.height = Math.ceil(h * 0.5);
				tctx.drawImage(canvas, 0, 0, w, h);

				steps = Math.ceil(Math.log(canvas.width / sw) / Math.log(2)) - 1;

				// step down 50% each time
				if (steps > 0) {
					while(steps--) {
						ow = w;
						oh = h;
						w = Math.ceil(w * 0.5);
						h = Math.ceil(h * 0.5);
						tctx.drawImage(tcanvas, 0, 0, ow, oh, 0, 0, w, h)
					}
				}

				canvas.width = sw;
				canvas.height = sh;
				ctx.drawImage(tcanvas, 0, 0, w, h, 0, 0, sw, sh);
			}
			else {
				tcanvas.width = sw;
				tcanvas.height = sh;
				tctx.drawImage(canvas, 0, 0, sw, sh);
				canvas = tcanvas;
			}
		}
	}
	catch(err) {
		me._err(errMsg, "toCanvas/s");
	}

	return canvas;
};