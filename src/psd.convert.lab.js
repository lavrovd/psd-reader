
PsdReader.prototype._lab = function(bmp) {

	var	bmps = this.info.bitmaps,
		L = bmps[0],
		a = bmps[1],
		b = bmps[2],
		alpha = bmps[3] || null,
		bw = this.info.byteWidth,
		hasAlpha = !!alpha,
		len = bmp.length,
		col, i = 0, p = 0;

	for(; i < len; p += bw) {
		col = lab2rgb(L[p], a[p], b[p]);
		bmp[i++] = col[0];
		bmp[i++] = col[1];
		bmp[i++] = col[2];
		bmp[i++] = hasAlpha ? alpha[p] : 255;
	}

	function lab2rgb(L, a, b) {

		// todo values from the buffer may have to be scaled/offset ... check buffer content
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

		// todo - here...
		y = (y3 > 0.008856 ? y3 : (y - 16 / 116) / 7.787);
		x = (x3 > 0.008856 ? x3 : (x - 16 / 116) / 7.787) * 0.950456;
		z = (z3 > 0.008856 ? z3 : (z - 16 / 116) / 7.787) * 1.088754;

		// double check values in this matrix
		R = x *  3.2406 + y * -1.5372 + z * -0.4986;
		G = x * -0.9689 + y *  1.8758 + z *  0.0415;
		B = x *  0.0557 + y * -0.2040 + z *  1.0570;

		// double check
		R = R > 0.0031308 ? 1.055 * Math.pow(R, 1 / 2.4) - 0.055 : 12.92 * R;
		G = G > 0.0031308 ? 1.055 * Math.pow(G, 1 / 2.4) - 0.055 : 12.92 * G;
		B = B > 0.0031308 ? 1.055 * Math.pow(B, 1 / 2.4) - 0.055 : 12.92 * B;

		return [
			(B * 255 + 0.5)|0,	//todo ..it's an experiment (the track from Jaws plays in the background...)
			(G * 255 + 0.5)|0,
			(R * 255 + 0.5)|0
		]
	}

};