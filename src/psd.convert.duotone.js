
PsdReader.prototype._duotone = function(dst) {

	var bmps = this.info.bitmaps,
		src = bmps[0],
		alpha = bmps[1],
		hasAlpha = !!alpha,
		tone = this._cfg.duotone,
		grey, r = tone[0], g = tone[1], b = tone[2],
		i = 0, p = 0, len = src.length;

	while(i < len) {
		grey = src[i];
		dst[p++] = ((grey * r) / 255 + 0.5)|0;
		dst[p++] = ((grey * g) / 255 + 0.5)|0;
		dst[p++] = ((grey * b) / 255 + 0.5)|0;
		dst[p++] = hasAlpha ? alpha[i] : 255;
		i++;
	}

};