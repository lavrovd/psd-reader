
PsdReader.prototype._raw = function(view, pos, info, callback) {

	// reference each channel (this is faaaaast...)
	for(var i = 0, len = info.channelSize; i < info.channels; i++, pos += len)
		info.bitmaps.push(new Uint8Array(view.buffer, pos, len));

	callback();
};