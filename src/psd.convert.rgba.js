/*
	psd-reader - RGBA converter
	By Ken Fyrstenberg / Epistemex (c) 2015
	www.epistemex.com
*/

/**
 * Converts RGBA (32/16/8) to 8-bit RGBA
 * @param bmps
 * @param dst
 * @param bw
 * @param iAlpha
 * @param c2v
 * @param f2i
 * @return {boolean}
 * @private
 */
PsdReader.prototype._rgba = function(bmps, dst, bw, iAlpha, c2v, f2i) {

	var	len = dst.length,
		i = 0, p = 0,
		r = bmps[0],
		g = bmps[1],
		b = bmps[2],
		a = bmps[3],		// RGB/MC alpha
		hasAlpha = !!a && !iAlpha;

	if (this.info.depth === 32) {

		r = c2v(r);
		g = c2v(g);
		b = c2v(b);
		if (hasAlpha) a = c2v(a);

		while(i < len) {
			dst[i++] = f2i(r, p);
			dst[i++] = f2i(g, p);
			dst[i++] = f2i(b, p);
			dst[i++] = hasAlpha ? f2i(a, p) : 255;
			p += bw
		}
	}
	else {
		while(i < len) {
			dst[i++] = r[p];
			dst[i++] = g[p];
			dst[i++] = b[p];
			dst[i++] = hasAlpha ? a[p] : 255;
			p += bw
		}
	}

	return hasAlpha
};