
PsdReader.prototype._toRGBA = function(cb) {

	var me = this,
		info = me.info,
		bmps = info.bitmaps,
		mode = info.colorMode,
		dst = new Uint8ClampedArray(info.width * info.height << 2);

	switch(mode) {
		case 0:		// bitmap
			me._bitmap(bmps[0], dst, info.width);
			break;
		case 2:		// indexed
			me._indexed(bmps[0], dst);
			break;
		case 8:		// Duotone
			me._duotone(dst);
			break;
		case 9:		// Lab
			me._lab(dst);
			break;
		default:	// Grey, RGB, CMYK, Multichannel (HSL/HSB not supported)
			me._rgba(bmps, dst, mode === 1);
			break;
	}

	cb(dst);
};