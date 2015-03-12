
PsdReader.prototype._duotone = function(bmp) {

	var gb = this.info.bitmaps[0],
		a = this.info.bitmaps[1] || null,
		alpha = !!a,
		g, i = 0, p = 0, len = gb.length,
		tone = this._cfg.duotone;
		//toneRes = this.findResource(1047),
		//tone;

	/*if (toneRes) {
		view = new DataView(this.buffer, tRes.pos, 2);
		tIndex = view.getInt16(0);
	}*/

	while(i < len) {
		g = gb[i];
		bmp[p++] = ((g * tone[0]) / 255 + 0.5)|0;
		bmp[p++] = ((g * tone[1]) / 255 + 0.5)|0;
		bmp[p++] = ((g * tone[2]) / 255 + 0.5)|0;
		bmp[p++] = alpha ? a[i] : 255;
		i++;
	}

};