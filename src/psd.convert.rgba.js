
PsdReader.prototype._rgba = function(bmps, dst, bw, iAlpha, c2v, gLUT, f2i) {

	var me = this,
		len = dst.length,
		i = 0, p = 0,
		r = bmps[0],
		g = bmps[1],
		b = bmps[2],
		a = bmps[3],		// RGB/MC alpha
		hasAlpha = !!a && !iAlpha;

	if (me.info.depth === 32) {

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