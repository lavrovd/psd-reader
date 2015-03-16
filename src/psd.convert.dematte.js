/**
 * "Demattes" the photoshop bitmap using white matte.
 * This method should only be called if an alpha channel is present.
 * Can be turned off with options (noDematte = true).
 *
 * Photoshop seem to always use a white matte, but have in mind that
 * black mattes are also very common so we might need an option for this
 * if PSD files shows up with this.
 *
 * @param {Uint8Array} bmp - reference to the bitmap, will adjust in-place
 * @param {function} callback - callback function when done
 * @private
 */
PsdReader.prototype._dematte = function(bmp, callback) {

	var i = 0, len = bmp.length, bs = PsdReader._blockSize, block = bs;

	(function dematte() {

		var r, g, b, a, aa;

		while(i < len && block--) {

			a = bmp[i+3];

			if (a && a < 255) {
				a /= 255;
				aa = 255 * (1 - a);

				r = bmp[i] - aa;
				g = bmp[i+1] - aa;
				b = bmp[i+2] - aa;

				bmp[i  ] = r / a + 0.5;
				bmp[i+1] = g / a + 0.5;
				bmp[i+2] = b / a + 0.5;
			}

			i +=4
		}

		if (i < len) {
			block = bs;
			setTimeout(dematte, PsdReader._delay);
		}
		else callback(bmp);
	})();
};