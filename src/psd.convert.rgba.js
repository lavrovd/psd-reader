
PsdReader.prototype._toRGBA = function(cb) {

	var me = this,
		info = this.info,
		bmp = new Uint8ClampedArray(info.width * info.height << 2),
		len = bmp.length,
		mode = info.colorMode,
		depth = info.depth,
		bw = info.byteWidth,
		r, g, b, a, i, p;

	switch(mode) {
		case 0:		// bitmap
			doBitmap(info.bitmaps[0], bmp, info.width<<2);
			cb(bmp);
			return;
		case 1:		// greyscale
			r = g = b = info.bitmaps[0];
			a = info.bitmaps[1] || null;
			break;
		case 2:		// indexed
			doIndexed(info.bitmaps[0], bmp, info.chunks[1]);
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
			doLAB(bmp);
			cb(bmp);
			return;
	}

	p = 0;

	if (depth === 32) {
		r = new DataView(me.buffer, r.byteOffset, r.byteLength);
		if (g) g = new DataView(me.buffer, g.byteOffset, g.byteLength);
		if (b) b = new DataView(me.buffer, b.byteOffset, b.byteLength);
		if (a) a = new DataView(me.buffer, a.byteOffset, a.byteLength);

		// create gamma LUT
		var gamma = 1 / ((navigator.userAgent.indexOf("Mac OS") > -1) ? 1.8 : 2.2),
			lut = new Uint8Array(256),
			t = 0;

		for(; t < 256; t++) lut[t] = (Math.pow(t / 255, gamma) * 255 + 0.5)|0;

		if (a) {
			if (mode === 3) {
				for(i = 0; i < len; p += bw) {
					bmp[i++] = lut[(r.getFloat32(p) * 255 + 0.5)|0];
					bmp[i++] = lut[(g.getFloat32(p) * 255 + 0.5)|0];
					bmp[i++] = lut[(b.getFloat32(p) * 255 + 0.5)|0];
					bmp[i++] = lut[(a.getFloat32(p) * 255 + 0.5)|0];
				}
			}
			else if (mode === 1) {
				for(i = 0; i < len; p += bw) {
					var grey = lut[(r.getFloat32(p) * 255 + 0.5)|0];
					bmp[i++] = grey;
					bmp[i++] = grey;
					bmp[i++] = grey;
					bmp[i++] = a.getFloat32(p) * 255;
				}
			}
		}
		else {
			for(i = 0; i < len; p += bw) {
				bmp[i++] = lut[(r.getFloat32(p) * 255 + 0.5)|0];
				bmp[i++] = lut[(g.getFloat32(p) * 255 + 0.5)|0];
				bmp[i++] = lut[(b.getFloat32(p) * 255 + 0.5)|0];
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

	function doIndexed(src, dst, colorInfoChunk) {

		var len = src.length,
			dlt = colorInfoChunk.length,
			dltG = dlt / 3,
			dltB = dltG * 2,
			tbl = new Uint8Array(me.buffer, colorInfoChunk.pos, dlt),
			i = 0, t = 0, index;

		while(i < len) {
			index = src[i++];
			dst[t++] = tbl[index];
			dst[t++] = tbl[index + dltG];
			dst[t++] = tbl[index + dltB];
			dst[t++] = 255;
		}
	}

	function doBitmap(src, dst, w) {

		var len = src.length,
			i = 0, t = 0, b;

		while(i < len) {
			b = getPixel();
			dst[t++] = b;
			dst[t++] = b;
			dst[t++] = b;
			dst[t++] = 255;
			if (t % w === 0) i = Math.ceil(i);
		}

		function getPixel() {
			var b = src[i|0],
				bitIndex = (i - (i|0)) / 0.125;
			i += 0.125;
			return (b & (0x80>>>bitIndex)) ? 0 : 255;
		}
	}

	function doLAB(bmp) {

		var L = info.bitmaps[0],
			a = info.bitmaps[1],
			b = info.bitmaps[2],
			alpha = info.bitmaps[3] || null,
			col, i = 0, p = 0;

		if (alpha) {
			for(; i < len; p += bw) {
				col = lab2rgb(L[p], a[p], b[p]);
				bmp[i++] = col[0];
				bmp[i++] = col[1];
				bmp[i++] = col[2];
				bmp[i++] = alpha[p];
			}
		}
		else {
			for(; i < len; p += bw) {
				col = lab2rgb(L[p], a[p], b[p]);
				bmp[i++] = col[0];
				bmp[i++] = col[1];
				bmp[i++] = col[2];
				bmp[i++] = 255;
			}

		}
	}

	function lab2rgb(L, a, b) {

		L /= 2.55;
		a = 128 - a;
		b = 128 - b;

		var y = (L + 16) / 116,
			x = a / 500 + y,
			z = y - b / 200,
			x3 = Math.pow(x, 3),
			y3 = Math.pow(y, 3),
			z3 = Math.pow(z, 3),
			R, G, B;

		y = (y3 > 0.008856 ? y3 : (y - 16 / 116) / 7.787);
		x = (x3 > 0.008856 ? x3 : (x - 16 / 116) / 7.787) * 0.950456;
		z = (z3 > 0.008856 ? z3 : (z - 16 / 116) / 7.787) * 1.088754;

		R = x *  3.2406 + y * -1.5372 + z * -0.4986;
		G = x * -0.9689 + y *  1.8758 + z *  0.0415;
		B = x *  0.0557 + y * -0.2040 + z *  1.0570;

		R = R > 0.0031308 ? 1.055 * Math.pow(R, 1 / 2.4) - 0.055 : 12.92 * R;
		G = G > 0.0031308 ? 1.055 * Math.pow(G, 1 / 2.4) - 0.055 : 12.92 * G;
		B = B > 0.0031308 ? 1.055 * Math.pow(B, 1 / 2.4) - 0.055 : 12.92 * B;

		return [
			(R * 255 + 0.5)|0,
			(G * 255 + 0.5)|0,
			(B * 255 + 0.5)|0
		]
	}
};