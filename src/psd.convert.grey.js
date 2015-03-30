/*
	psd-reader - Greyscale converter
	By Ken Fyrstenberg / Epistemex (c) 2015
	www.epistemex.com
*/

/**
 * Converts greyscale based image to RGBA
 * @param bmps
 * @param dst
 * @param bw
 * @param iAlpha
 * @param c2v
 * @param f2i
 * @return {boolean}
 * @private
 */
PsdReader.prototype._grey = function(bmps, dst, bw, iAlpha, c2v, f2i) {

	var	u32 = new Uint32Array(dst.buffer),
		len = u32.length,
		i = 0, p = 0, g, a, grey, hasAlpha;

	g = bmps[0];
	a = bmps[1];

	hasAlpha = !!a && !iAlpha;

	if (this.info.depth < 32) {
		while(i < len) {
			grey = g[p];
			u32[i++] =((hasAlpha ? a[p] : 255)<<24) | (grey << 16) | (grey<<8) | grey;
			p += bw
		}
	}
	else {
		g = c2v(g);
		if (hasAlpha) a = c2v(a);

		while(i < len) {
			grey = f2i(g, p);
			u32[i++] = ((hasAlpha ? f2i(a, p) : 255)<<24) | (grey << 16) | (grey<<8) | grey;
			p += bw
		}
	}

	return hasAlpha
};