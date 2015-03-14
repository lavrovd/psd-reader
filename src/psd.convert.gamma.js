
/**
 * Applies gamma if bmp, gamma !== 0 and gamma !== 1 and depth < 32.
 * bmp has to be 8-bits RGBA raw buffer
 * @param {Uint8Array} bmp - bitmap the gamma will be applied to
 * @private
 */
PsdReader.prototype._gamma = function(bmp) {

	if (!bmp) return;

	var gamma = this._cfg.gamma,
		depth = this.info.depth,
		len = bmp.length, i = 0, lut;

	if (gamma && gamma !== 1 && depth < 32) {
		lut = this.getGammaLUT(gamma);
		i = 0;

		while(i < len) {
			bmp[i] = lut[bmp[i++]];
			bmp[i] = lut[bmp[i++]];
			bmp[i] = lut[bmp[i++]];
			i++;
		}
	}
};