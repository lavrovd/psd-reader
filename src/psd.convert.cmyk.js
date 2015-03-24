/*
	psd-reader - CMYK converter
	By Ken Fyrstenberg / Epistemex (c) 2015
	www.epistemex.com
*/

/**
 * Non-ICC based conversion using K-channel.
 * @param bmps
 * @param dst
 * @param bw
 * @param iAlpha
 * @return {boolean}
 * @private
 */
PsdReader.prototype._cmyk = function(bmps, dst, bw, iAlpha) {

	var len = dst.length,
		i = 0, p = 0,
		r = bmps[0],
		g = bmps[1],
		b = bmps[2],
		k = bmps[3],
		a = bmps[4],
		kk,
		hasAlpha = !!a && !iAlpha;

	while(i < len) {
		kk = k[p] / 255;
		dst[i++] = r[p] * kk + 0.5;
		dst[i++] = g[p] * kk + 0.5;
		dst[i++] = b[p] * kk + 0.5;
		dst[i++] = hasAlpha ? a[p] : 255;
		p += bw
	}

	return hasAlpha
};