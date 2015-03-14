/**
 * Returns the indexed color table if present, or null. The number of
 * entries is always 256. The indexed color values are not interleaved,
 * but hold first the reds, greens then blue.
 * @return {Uint8Array|null}
 */
PsdReader.prototype.getIndexTable = function() {
	var ci = this.info.chunks[1];
	if (ci.length) return new Uint8Array(this.buffer, ci.pos, ci.length);
	return null
};

/**
 * Convert a color index (when indexed mode) to little-endian unsigned
 * 32-bit integer including full opaque for alpha channel. Can be set
 * directly on an Uin32Array view for a canvas buffer.
 * @param {Uint8Array} tbl - the table holding the color indexes
 * @param {number} index - value from [0, 255]. Max depends on how many indexes the image contains.
 * @param {boolean} [alpha=false] - if true ANDs out the alpha.
 * @return {number} unsigned 32-bit integer in little-endian format (ABGR).
 */
PsdReader.prototype.indexToInt = function(tbl, index, alpha) {
	var v = 0xff000000 + (tbl[index + 512]<<16) + (tbl[index + 256]<<8) + tbl[index];
	if (alpha) v &= 0xffffff;
	return v;
};

/* no use for these (yet.. ?)
PsdReader.prototype.channelTo16 = function(bmp) {
	return new Uint16Array(bmp.buffer, bmp.byteOffset, bmp.byteLength>>1);
};

PsdReader.prototype.channelTo32 = function(bmp) {
	return new Uint32Array(bmp.buffer, bmp.byteOffset, bmp.byteLength>>2);
};
*/

/**
 * Converts a Uint8Array/view region to DataView for the same region.
 * @param {*} bmp - a view representing a region of a ArrayBuffer
 * @return {DataView}
 * @private
 */
PsdReader.prototype._chanToDV = function(bmp) {
	return new DataView(bmp.buffer, bmp.byteOffset, bmp.byteLength);
};

/**
 * Create a gamma look-up table (LUT) based on the provided inverse gamma.
 *
 * @param {number} gamma - inverse gamma (ie. 1/2.2, 1/1.8 etc.)
 * @return {Uint8ClampedArray}
 */
PsdReader.prototype.getGammaLUT = function(gamma) {
	var lut = new Uint8ClampedArray(256), i;
	for(i = 0; i < 256; i++) lut[i] = (Math.pow(i / 255, gamma) * 255 + 0.5)|0;
	return lut
};

/**
 * Convers a 32-bit floating point value to integer. It reads the value
 * from the given channel (which is of type DataView) at position pos.
 * @param {DataView} channel - channel to read from
 * @param {number} pos - position to read from
 * @return {number} converted integer value in the range [0, 255]
 */
PsdReader.prototype.floatToComp = function(channel, pos) {
	return (channel.getFloat32(pos) * 255 + 0.5)|0
};
