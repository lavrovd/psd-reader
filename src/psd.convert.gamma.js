/*
	psd-reader - Gamma module
	By Ken Fyrstenberg / Epistemex (c) 2015
	www.epistemex.com
*/

/**
 * Applies gamma if bmp, gamma !== 0 and gamma !== 1 and depth < 32.
 * bmp has to be 8-bits RGBA raw buffer
 * @param {Uint8Array|Uint8ClampedArray} bmp - bitmap the gamma will be applied to
 * @param {number} gamma - inverse gamma to apply
 * @private
 */
PsdReader.prototype._gamma = function(bmp, gamma) {

	if (!bmp || !gamma || gamma === 1) return;

	var i = 0, len = bmp.length, lut = this.getGammaLUT(gamma);

	while(i < len) {
		bmp[i] = lut[bmp[i++]];
		bmp[i] = lut[bmp[i++]];
		bmp[i] = lut[bmp[i++]];
		i++;
	}
};