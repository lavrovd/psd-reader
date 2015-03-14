
PsdReader.prototype._rgba = function(bmps, dst, isGrey) {

	var me = this,
		info = me.info,
		c2v = me._chanToDV.bind(me),
		mode = info.colorMode,
		bw = info.byteWidth,
		len = dst.length,
		i = 0, p = 0,
		r, g, b, a, grey, hasAlpha, gamma, lut, f2i;

	r = bmps[0];
	g = bmps[1];
	b = bmps[2];
	a = bmps[4] || bmps[(isGrey ? 1 : 3)];

	hasAlpha = !!a;

	if (info.depth === 32) {

		r = c2v(r);
		if (hasAlpha) a = c2v(a);

		// create gamma LUT
		gamma = me._cfg.gamma32;
		lut = me.getGammaLUT(gamma);
		f2i = me.floatToComp;

		if (mode === 3) {

			if (g) g = c2v(g);
			if (b) b = c2v(b);

			while(i < len) {
				dst[i++] = lut[f2i(r, p)];
				dst[i++] = lut[f2i(g, p)];
				dst[i++] = lut[f2i(b, p)];
				dst[i++] = hasAlpha ? lut[f2i(a, p)] : 255;
				p += bw
			}
		}
		else {
			while(i < len) {
				grey = lut[f2i(r, p)];
				dst[i++] = grey;
				dst[i++] = grey;
				dst[i++] = grey;
				dst[i++] = hasAlpha ? f2i(a, p) : 255;
				p += bw
			}
		}
	}
	else {
		if (mode === 1) {
			while(i < len) {
				grey = r[p];
				dst[i++] = grey;
				dst[i++] = grey;
				dst[i++] = grey;
				dst[i++] = hasAlpha ? a[p] : 255;
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
	}
};