/*
	psd-reader - Indexed converter
	By Ken Fyrstenberg / Epistemex (c) 2015
	www.epistemex.com
*/

/**
 * Converts index format to RGBA
 * @param src
 * @param dst
 * @param iAlpha
 * @return {boolean}
 * @private
 */
PsdReader.prototype._indexed = function(src, dst, iAlpha) {

	var me = this,
		len = src.length,
		tbl = me.getIndexTable(),
		u32 = new Uint32Array(dst.buffer),
		i = 0, index, col, max = -1, tIndex = -1,
		tRes = iAlpha ? null : me.findResource(1047);	// id 1047 = transparency for index

	if (tRes) tIndex = new DataView(me.buffer, tRes.pos, 2).getInt16(0);

	while(i < len) {
		index = src[i];
		col =  me.indexToInt(tbl, index, index === tIndex);
		u32[i++] = col;
		if (index > max) max = index;
	}

	me.info.indexes = ++max;	// same info as in res id 1046

	return false; //tIndex > -1 - there is no actual channel for this, so return false
};
