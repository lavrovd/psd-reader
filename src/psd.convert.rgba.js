
PsdReader.prototype._toRGBA = function(cb) {

	var info = this.info,
		bmp = new Uint8ClampedArray(info.width * info.height << 2),
		len = bmp.length,
		mode = info.colorMode,
		depth = info.depth,
		bw = info.byteWidth,
		r, g, b, a, i, p;

	switch(mode) {
		case 0:		// bitmap
			this._bitmap(info.bitmaps[0], bmp, info.width);
			cb(bmp);
			return;
		case 1:		// greyscale
			r = g = b = info.bitmaps[0];
			a = info.bitmaps[1] || null;
			break;
		case 2:		// indexed
			this._indexed(info.bitmaps[0], bmp);
			cb(bmp);
			return;
		case 3:		// RGB
		case 4:		// CMYK
		case 5:		// HSL
		case 6:		// HSB
			r = info.bitmaps[0];
			g = info.bitmaps[1];
			b = info.bitmaps[2];
			a = info.bitmaps[4] || info.bitmaps[3] || null;
			break;
		case 7:		// Multichannel
			r = info.bitmaps[0];
			g = info.bitmaps[1];
			b = info.bitmaps[2];
			break;
		case 8:		// Duotone
			cb(null);
			return;
		case 9:		// Lab
			this._lab(bmp);
			cb(bmp);
			return;
	}

	p = 0;

	// todo refactor these too, consider function vectors for a single/duo loop.
	// Rolled-out loops faster, but..

	if (depth === 32) {

		r = this.channelToDataView(r);
		if (g) g = this.channelToDataView(g);
		if (b) b = this.channelToDataView(b);
		if (a) a = this.channelToDataView(a);

		// create gamma LUT
		var gamma = this._cfg.gamma32,
			lut = this.getGammaLUT(gamma),
			f2i = this.floatToComp;

		if (a) {
			if (mode === 3) {
				for(i = 0; i < len; p += bw) {
					bmp[i++] = lut[f2i(r, p)];
					bmp[i++] = lut[f2i(g, p)];
					bmp[i++] = lut[f2i(b, p)];
					bmp[i++] = lut[f2i(a, p)];
				}
			}
			else if (mode === 1) {
				for(i = 0; i < len; p += bw) {
					var grey = lut[(r.getFloat32(p) * 255 + 0.5) | 0];
					bmp[i++] = grey;
					bmp[i++] = grey;
					bmp[i++] = grey;
					bmp[i++] = a.getFloat32(p) * 255;
				}
			}
		}
		else {
			for(i = 0; i < len; p += bw) {
				bmp[i++] = lut[f2i(r, p)];
				bmp[i++] = lut[f2i(g, p)];
				bmp[i++] = lut[f2i(b, p)];
				bmp[i++] = 255;
			}
		}

	}
	else {
		if (a) {
			for(i = 0; i < len; p += bw) {
				bmp[i++] = r[p];
				bmp[i++] = g[p];
				bmp[i++] = b[p];
				bmp[i++] = a[p];
			}
		}
		else {
			for(i = 0; i < len; p += bw) {
				bmp[i++] = r[p];
				bmp[i++] = g[p];
				bmp[i++] = b[p];
				bmp[i++] = 255;
			}
		}

	}

	cb(bmp);
};