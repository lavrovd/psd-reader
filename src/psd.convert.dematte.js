/*
	psd-reader - Dematte process
	By Ken Fyrstenberg / Epistemex (c) 2015
	www.epistemex.com
*/

/**
 * "Demattes" the photoshop bitmap using white matte.
 * This method should only be called if an alpha channel is present.
 * Can be turned off with options (noDematte = true).
 *
 * Photoshop seem to always use a white matte, but have in mind that
 * black mattes are also very common so we might need an option for this
 * if PSD files shows up with this.
 *
 * @param {Uint8Array|Uint8ClampedArray} bmp - reference to the bitmap, will adjust in-place
 * @param {function} callback - callback function when done
 * @private
 */
PsdReader.prototype._dematte = function(bmp, callback) {

	var i = 0, len = bmp.length, bSize = PsdReader._bSz, block = bSize;

	(function dematte() {

		var a, aa;

		while(i < len && block--) {

			a = bmp[i+3];

			if (a && a < 255) {
				a /= 255;
				aa = 255 * (1 - a);		// white matte assumed

				bmp[i] = (bmp[i++] - aa) / a + .5;
				bmp[i] = (bmp[i++] - aa) / a + .5;
				bmp[i] = (bmp[i++] - aa) / a + .5;
				i++;
			}
			else i += 4
		}

		if (i < len) {
			block = bSize;
			setTimeout(dematte, PsdReader._delay);
		}
		else callback(bmp);
	})();
};