
PsdReader.prototype._rle = function(view, pos, info, callback) {

	var count = 0, i = info.channels, block = PsdReader._blockSize,
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
		doChannel(uint8view, channel);

		block -= channel.length;

		if (--i) {
			if (block > 0) decode();
			else {
				block = PsdReader._blockSize;
				setTimeout(decode, PsdReader._delay)
			}
		}
		else callback();
	})();

	function doChannel(uint8, channel) {

		var p = 0, h = info.height;

		while(h--) {
			var	len, v, lineEnd = Math.min(pos + byteCounts[count++], fileEnd);

			while(pos < lineEnd) {
				len = uint8[pos++];						//todo error checks "buffer overflow"
				if (len > 128) {
					len = 257 - len;
					v = uint8[pos++];
					//channel.fill(v, p, (p += len));		// don't use, slower... fill() in FF only for now, polyfill in core module
					while(len--) channel[p++] = v;
				}
				else if (len < 128) {
					len++;
					while(len--) channel[p++] = uint8[pos++];
					//channel.set(new Uint8Array(uint8.buffer, pos, ++len), p);	// don't use, 2x slower
					//p += len;
					//pos += len;
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