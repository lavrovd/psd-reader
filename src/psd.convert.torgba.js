
PsdReader.prototype._toRGBA = function(cb) {

	var me = this,
		info = me.info,
		cfg = me._cfg,
		bmps = info.bitmaps,
		bw = info.byteWidth,
		c2v = me._chanToDV.bind(me),
		gLUT = me.getGammaLUT,
		f2i = me.floatToComp,
		w = info.width,
		iAlpha = cfg.ignoreAlpha,
		dst = new Uint8ClampedArray(w * info.height << 2);

	// delegate color mode handler -

	switch(info.colorMode) {
		case 0:		// bitmap
			iAlpha = me._bitmap(bmps[0], dst, w);
			break;

		case 1:		// Grey
			iAlpha = me._grey(bmps, dst, bw, iAlpha, c2v, gLUT, f2i);
			break;

		case 2:		// indexed
			iAlpha = me._indexed(bmps[0], dst, iAlpha);
			break;

		case 4:		// CMYK
			iAlpha = me._cmyk(bmps, dst, bw, iAlpha, c2v, gLUT, f2i);
			break;

		case 8:		// Duotone
			iAlpha = me._duotone(bmps, dst, iAlpha);
			break;

		case 9:		// Lab
			iAlpha = me._lab(bmps, dst, bw, iAlpha);
			break;

		default:	// RGB, Multichannel
			iAlpha = me._rgba(bmps, dst, bw, iAlpha, c2v, gLUT, f2i);
	}

	info.hasAlpha = iAlpha;

	// gamma correction
	me._gamma(dst, info.depth === 32 ? cfg.gamma32 : cfg.gamma);

	// dematte if alpha
	(iAlpha && !cfg.noDematte) ? me._dematte(dst, cb) : cb(dst);
};