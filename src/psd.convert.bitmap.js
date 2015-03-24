/*
	psd-reader - Bitmap converter
	By Ken Fyrstenberg / Epistemex (c) 2015
	www.epistemex.com
*/

/**
 * Converts bitmap (1-bit) data to RGBA.
 * @param {*} src - a typed array view
 * @param {Uint8ClampedArray} dst
 * @param {number} w - scanline width (for padding)
 * @private
 */
PsdReader.prototype._bitmap = function(src, dst, w) {

	var	u32 = new Uint32Array(dst.buffer),
		len = src.length,
		i = 0, t = 0, lineEnd = w;

	while(i < len) {
		while(t < lineEnd) {
			u32[t++] = getPixel32(i);
			i += 0.125;
		}
		i = Math.ceil(i);
		lineEnd += w;
	}

	function getPixel32(i) {
		var b = src[i|0], bitIndex = (i - (i|0)) / 0.125;
		return (b & (0x80>>bitIndex)) ? 0xff000000 : 0xffffffff;
	}

	return false
};