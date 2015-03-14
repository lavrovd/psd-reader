
PsdReader.prototype._toRGBA = function(cb) {

	var me = this,
		info = me.info,
		bmps = info.bitmaps,
		bmp = new Uint8ClampedArray(info.width * info.height << 2),
		c2v = me._chanToDV.bind(me),
		len = bmp.length,
		mode = info.colorMode,
		depth = info.depth,
		alpha,
		bw = info.byteWidth,
		r, g, b, a, i = 0, p = 0, grey,
		gamma, lut, f2i;

	switch(mode) {
		case 0:		// bitmap
			me._bitmap(bmps[0], bmp, info.width);
			cb(bmp);
			return;
		case 1:		// greyscale
			r = bmps[0];
			a = bmps[1] || null;
			break;
		case 2:		// indexed
			me._indexed(bmps[0], bmp);
			cb(bmp);
			return;
		case 3:		// RGB
		case 4:		// CMYK
		case 5:		// HSL
		case 6:		// HSB
		case 7:		// Multichannel
			r = bmps[0];
			g = bmps[1];
			b = bmps[2];
			a = bmps[4] || bmps[3] || null;
			break;
		case 8:		// Duotone
			me._duotone(bmp);
			cb(bmp);
			return;
		case 9:		// Lab
			me._lab(bmp);
			cb(bmp);
			return;
	}

	alpha = !!a;

	if (depth === 32) {

		r = c2v(r);
		if (g) g = c2v(g);
		if (b) b = c2v(b);
		if (a) a = c2v(a);

		// create gamma LUT
		gamma = me._cfg.gamma32;
		lut = me.getGammaLUT(gamma);
		f2i = me.floatToComp;

		if (mode === 3) {
			while(i < len) {
				bmp[i++] = lut[f2i(r, p)];
				bmp[i++] = lut[f2i(g, p)];
				bmp[i++] = lut[f2i(b, p)];
				bmp[i++] = alpha ? lut[f2i(a, p)] : 255;
				p += bw
			}
		}
		else {
			while(i < len) {
				grey = lut[(r.getFloat32(p) * 255 + 0.5) | 0];
				bmp[i++] = grey;
				bmp[i++] = grey;
				bmp[i++] = grey;
				bmp[i++] = alpha ? a.getFloat32(p) * 255 : 255;
				p += bw
			}
		}
	}
	else {
		if (mode === 1) {
			while(i < len) {
				grey = r[p];
				bmp[i++] = grey;
				bmp[i++] = grey;
				bmp[i++] = grey;
				bmp[i++] = alpha ? a[p] : 255;
				p += bw
			}
		}
		else {
			while(i < len) {
				bmp[i++] = r[p];
				bmp[i++] = g[p];
				bmp[i++] = b[p];
				bmp[i++] = alpha ? a[p] : 255;
				p += bw
			}
		}
	}

	cb(bmp);
};