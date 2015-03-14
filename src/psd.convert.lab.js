
PsdReader.prototype._lab = function(dst) {

	var	bmps = this.info.bitmaps,
		L = bmps[0],
		a = bmps[1],
		b = bmps[2],
		alpha = bmps[3] || null,
		bw = this.info.byteWidth,
		hasAlpha = !!alpha,
		len = dst.length,
		col, i = 0, p = 0;

	for(; i < len; p += bw, i += 4) {
		col = lab2rgb(L[p] / 2.55, a[p] - 128, b[p] - 128, dst, i);
		dst[i+3] = hasAlpha ? alpha[p] : 255;
	}

	function lab2rgb(L, a, b, dst, i) {

		var y = (L + 16) / 116,
			x = a / 500 + y,
			z = y - b / 200,
			x3 = Math.pow(x, 3),
			y3 = Math.pow(y, 3),
			z3 = Math.pow(z, 3),
			R, G, B;

		y = (y3 > 0.008856 ? y3 : (y - 0.137931) / 7.787);				//0.13... from 16/116
		x = (x3 > 0.008856 ? x3 : (x - 0.137931) / 7.787) * 0.950456;
		z = (z3 > 0.008856 ? z3 : (z - 0.137931) / 7.787) * 1.088754;

		R = x *  3.2406 + y * -1.5372 + z * -0.4986;
		G = x * -0.9689 + y *  1.8758 + z *  0.0415;
		B = x *  0.0557 + y * -0.2040 + z *  1.0570;

		R = R > 0.0031308 ? 1.055 * Math.pow(R, 0.41667) - 0.055 : 12.92 * R;
		G = G > 0.0031308 ? 1.055 * Math.pow(G, 0.41667) - 0.055 : 12.92 * G;
		B = B > 0.0031308 ? 1.055 * Math.pow(B, 0.41667) - 0.055 : 12.92 * B;

		dst[i++] = R * 255;
		dst[i++] = G * 255;
		dst[i] = B * 255;
	}
};