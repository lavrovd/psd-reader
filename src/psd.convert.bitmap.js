
/**
 * Converts bitmap (1-bit) data to RGBA.
 * @param {*} src - a typed array view
 * @param {Uint8Array} dst
 * @param {number} w - scanline width (for padding)
 * @private
 */
PsdReader.prototype._bitmap = function(src, dst, w) {

	var	u32 = new Uint32Array(dst.buffer),
		len = src.length,
		i = 0, t = 0;

	while(i < len) {
		u32[t++] = getPixel32();
		if (t % w === 0) i = Math.ceil(i);
	}

	function getPixel32() {
		var b = src[i|0], bitIndex = (i - (i|0)) / 0.125;
		i += 0.125;
		return (b & (0x80>>bitIndex)) ? 0xff000000 : 0xffffffff;
	}
};