/*
	psd-reader - L*a*b converter
	By Ken Fyrstenberg / Epistemex (c) 2015
	www.epistemex.com
*/

/**
 * Converts Lab to RGBA
 * @param bmps
 * @param dst
 * @param bw
 * @param iAlpha
 * @return {number}
 * @private
 */
PsdReader.prototype._lab = function(bmps, dst, bw, iAlpha) {

	var	L = bmps[0],
		a = bmps[1],
		b = bmps[2],
		alpha = bmps[3],
		hasAlpha = !!alpha & !iAlpha,
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
			x3 = Math.pow(x, 3),	// x*x*x is sliiightly faster in FF, but slower in Chrome
			y3 = Math.pow(y, 3),	// FF is 2x faster than chrome here, so we keep this
			z3 = Math.pow(z, 3),	// to squeeze out what we can in Chrome..
			R, G, B;

		y = (y3 > 0.0088561 ? y3 : (y - 0.137931) / 7.787);				//0.13... from 16/116
		x = (x3 > 0.0088561 ? x3 : (x - 0.137931) / 7.787) * 0.950456;
		z = (z3 > 0.0088561 ? z3 : (z - 0.137931) / 7.787) * 1.088754;

		R = x *  3.2406 + y * -1.5372 + z * -0.4986;
		G = x * -0.9689 + y *  1.8758 + z *  0.0415;
		B = x *  0.0557 + y * -0.2040 + z *  1.0570;

		R = R > 0.0031308 ? 1.055 * Math.pow(R, 0.41667) - 0.055 : 12.92 * R;
		G = G > 0.0031308 ? 1.055 * Math.pow(G, 0.41667) - 0.055 : 12.92 * G;
		B = B > 0.0031308 ? 1.055 * Math.pow(B, 0.41667) - 0.055 : 12.92 * B;

		dst[i++] = R * 255;		// leave rounding to the browser (note: ES perc. 0.5 != up, >= 0.5000001 == up..)
		dst[i++] = G * 255;
		dst[i]   = B * 255;
	}

	return hasAlpha
};