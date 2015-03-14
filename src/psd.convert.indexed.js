
PsdReader.prototype._indexed = function(src, dst) {

	var me = this,
		len = src.length,
		tbl = me.getIndexTable(),
		getCol = me.indexToInt,
		u32 = new Uint32Array(dst.buffer),
		i = 0, index, col, max = -1, tIndex = -1, view,
		tRes = me.findResource(1047);	// id 1047 = transparency for index

	if (tRes) {
		view = new DataView(me.buffer, tRes.pos, 2);
		tIndex = view.getInt16(0);
	}

	while(i < len) {
		index = src[i];
		col = getCol(tbl, index, index === tIndex);
		u32[i++] = col;
		if (index > max) max = index;
	}

	me.info.indexes = ++max;
};
