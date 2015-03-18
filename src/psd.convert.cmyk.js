
PsdReader.prototype._cmyk = function(bmps, dst, bw, iAlpha, c2v, gLUT, f2i) {

	var me = this,
		len = dst.length,
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
		dst[i++] = r[p] * kk;
		dst[i++] = g[p] * kk;
		dst[i++] = b[p] * kk;
		dst[i++] = hasAlpha ? a[p] : 255;
		p += bw
	}

	return hasAlpha
};