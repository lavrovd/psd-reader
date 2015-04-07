/*
	psd-reader - RAW format handler
	By Ken Fyrstenberg / Epistemex (c) 2015
	www.epistemex.com
*/

/**
 * Process non-compressed data
 * @param view
 * @param pos
 * @param info
 * @param callback
 * @private
 */
PsdReader.prototype._raw = function(view, pos, info, callback) {

	// reference each channel (this is faaaaast...)
	for(var i = 0, len = info.channelSize; i < info.channels; i++, pos += len)
		this.bitmaps.push(new Uint8Array(view.buffer, pos, len));

	callback();
};