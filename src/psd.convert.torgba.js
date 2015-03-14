
PsdReader.prototype._toRGBA = function(cb) {

	var me = this,
		info = me.info,
		bmps = info.bitmaps,
		bmp = new Uint8ClampedArray(info.width * info.height << 2),
		mode = info.colorMode;

	switch(mode) {
		case 0:		// bitmap
			me._bitmap(bmps[0], bmp, info.width);
			break;
		case 1:		// greyscale
			me._rgba(bmps, bmp, true);
			break;
		case 2:		// indexed
			me._indexed(bmps[0], bmp);
			break;
		case 8:		// Duotone
			me._duotone(bmp);
			break;
		case 9:		// Lab
			me._lab(bmp);
			break;
		default:	// RGB, CMYK, Multichannel (HSL/HSB not supported)
			me._rgba(bmps, bmp);
			break;
	}

	cb(bmp);
};