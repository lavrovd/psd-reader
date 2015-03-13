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
 * @params {object} [options] - options
 * @params {number} [options.scale] - Scale factor for both x and y directions, 1 = 100%. If result of size is fraction, the size will be rounded to nearest integer number.
 * @params {boolean} [options.hq] - High-quality down-sample. Use if you need large images scaled down to small sizes.
 * @returns {HTMLCanvasElement|null}
 */
PsdReader.prototype.toCanvas = function(options) {

	if (!this.rgba) return null;

	options = options || {};

	var canvas = document.createElement("canvas"),
		ctx = canvas.getContext("2d"),
		tcanvas, tctx, steps,
		idata,
		scale = options.scale || 1,
		hq = !!options.hq,
		w = this.info.width, h = this.info.height, ow, oh,
		sw = (w * scale + 0.5)|0,
		sh = (h * scale + 0.5)|0;

	// convert RGBA full size to canvas (we can do a manual Lanczo resampling here later).
	try {
		canvas.width = w;
		canvas.height = h;

		idata = ctx.createImageData(w, h);
		idata.data.set(this.rgba);
		ctx.putImageData(idata, 0, 0);
	}
	catch(err) {
		this._err("Could not create canvas", "toCanvas");
	}

	try {
		if (scale !== 1) {
			tcanvas = document.createElement("canvas");
			tctx = tcanvas.getContext("2d");

			if (hq) {
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
		this._err("Could not create canvas", "toCanvas/scale");
	}

	return canvas;
};