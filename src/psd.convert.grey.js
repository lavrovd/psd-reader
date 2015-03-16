
PsdReader.prototype._grey = function(bmps, dst, bw, gamma, iAlpha, c2v, gLUT, f2i) {

	var me = this,
		len = dst.length,
		i = 0, p = 0, g, a, grey, hasAlpha, lut;

	g = bmps[0];
	a = bmps[1];

	hasAlpha = !!a && !iAlpha;

	if (me.info.depth === 32) {

		g = c2v(g);
		if (hasAlpha) a = c2v(a);

		// create gamma LUT
		lut = gLUT(gamma);

		while(i < len) {
			grey = lut[f2i(g, p)];
			dst[i++] = grey;
			dst[i++] = grey;
			dst[i++] = grey;
			dst[i++] = hasAlpha ? f2i(a, p) : 255;
			p += bw
		}
	}
	else {
		while(i < len) {
			grey = g[p];
			dst[i++] = grey;
			dst[i++] = grey;
			dst[i++] = grey;
			dst[i++] = hasAlpha ? a[p] : 255;
			p += bw
		}
	}
};