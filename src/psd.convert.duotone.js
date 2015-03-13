
PsdReader.prototype._duotone = function(bmp) {

	var gb = this.info.bitmaps[0],
		a = this.info.bitmaps[1] || null,
		alpha = !!a,
		tone = this._cfg.duotone,
		grey, r = tone[0], g = tone[1], b = tone[2],
		i = 0, p = 0, len = gb.length;

	while(i < len) {
		grey = gb[i];
		bmp[p++] = ((grey * r) / 255 + 0.5)|0;
		bmp[p++] = ((grey * g) / 255 + 0.5)|0;
		bmp[p++] = ((grey * b) / 255 + 0.5)|0;
		bmp[p++] = alpha ? a[i] : 255;
		i++;
	}

};