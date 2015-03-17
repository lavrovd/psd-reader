
PsdReader.prototype._rle = function(view, pos, info, callback) {

	var count = 0, i = info.channels,
		block = PsdReader._bSz,
		uint8view = new Uint8Array(view.buffer),
		fileEnd = view.buffer.byteLength,
		counts = info.height * info.channels,
		byteCounts = new Uint16Array(counts);

	// read byte lengths for each scanline
	while(count < counts) byteCounts[count++] = getUint16();
	count = 0;

	(function decode() {
		var channel = new Uint8Array(info.channelSize);
		info.bitmaps.push(channel);

		doChannel(uint8view, channel, fileEnd);
		block -= channel.length;

		if (--i) {
			if (block > 0) decode();
			else {
				block = PsdReader._bSz;
				setTimeout(decode, PsdReader._delay)
			}
		}
		else callback();
	})();

	function doChannel(uint8, channel, fileEnd) {

		var p = 0, len, v, lineEnd, h = info.height, goal;

		while(h--) {
			lineEnd = Math.min(pos + byteCounts[count++], fileEnd);

			while(pos < lineEnd) {
				len = uint8[pos++];
				if (len > 128) {
					len = 257 - len;
					v = uint8[pos++];
					goal = p + len;
					while(p < goal) channel[p++] = v;
				}
				else if (len < 128) {
					goal = p + ++len;
					while(p < goal) channel[p++] = uint8[pos++];
				}
			}
		}
	}

	function getUint16() {
		var v = view.getUint16(pos);
		pos += 2;
		return v;
	}
};