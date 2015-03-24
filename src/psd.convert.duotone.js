/*
	psd-reader - DuoTone converter
	By Ken Fyrstenberg / Epistemex (c) 2015
	www.epistemex.com
*/

/**
 * Converts DuoChannel format tp RGBA. Treats DuoTone format as grey.
 * @param bmps
 * @param dst
 * @param iAlpha
 * @return {boolean}
 * @private
 */
PsdReader.prototype._duotone = function(bmps, dst, iAlpha) {

	var src = bmps[0],
		alpha = bmps[1],
		hasAlpha = !!alpha && !iAlpha,
		tone = this.config.duotone,
		grey, r = tone[0] / 255, g = tone[1] / 255, b = tone[2] / 255,
		i = 0, p = 0, len = src.length;

	while(i < len) {
		grey = src[i];
		dst[p++] = grey * r + .5;
		dst[p++] = grey * g + .5;
		dst[p++] = grey * b + .5;
		dst[p++] = hasAlpha ? alpha[i] : 255;
		i++;
	}

	return hasAlpha
};