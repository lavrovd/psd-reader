
PsdReader.prototype._indexed = function(src, dst) {

	var len = src.length,
		tbl = this.getIndexTable(),
		getCol = this.indexToInt,
		u32 = new Uint32Array(dst.buffer),
		i = 0, index, col, max = -1, tIndex = -1, view,
		tRes = this.findResource(1047);	// id 1047 = transparency for index

	if (tRes) {
		view = new DataView(this.buffer, tRes.pos, 2);
		tIndex = view.getInt16(0);
	}

	while(i < len) {
		index = src[i];
		col = getCol(tbl, index);
		if (index === tIndex) col &= 0xffffff;
		u32[i++] = col;
		if (index > max) max = index;
	}

	this.info.indexes = ++max;
};
