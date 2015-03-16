
PsdReader.prototype._toRGBA = function(cb) {

	var me = this,
		info = me.info,
		bmps = info.bitmaps,
		mode = info.colorMode,
		bw = info.byteWidth,
		c2v = me._chanToDV.bind(me),
		gLUT = me.getGammaLUT,
		f2i = me.floatToComp,
		gamma32 = me._cfg.gamma32,
		iAlpha = me._cfg.ignoreAlpha,
		dst = new Uint8ClampedArray(info.width * info.height << 2);

	// delegate color mode handler -
	switch(mode) {
		case 0:		// bitmap
			me._bitmap(bmps[0], dst, info.width);
			break;
		case 1:		// Grey
			me._grey(bmps, dst, bw, gamma32, iAlpha, c2v, gLUT, f2i);
			break;
		case 2:		// indexed
			me._indexed(bmps[0], dst, iAlpha);
			break;
		/*case 4:		// cmyk
			me._cmyk(bmps, dst);
			break;*/
		case 8:		// Duotone
			me._duotone(bmps, dst, iAlpha);
			break;
		case 9:		// Lab
			me._lab(bmps, dst, bw, iAlpha);
			break;
		default:	// RGB, CMYK, Multichannel (HSL/HSB not supported)
			me._rgba(bmps, dst, bw, gamma32, iAlpha, c2v, gLUT, f2i);
			break;
	}

	cb(dst);
};