
PsdReader.prototype._parser = function(buffer) {

	var me = this,
		view = new DataView(buffer),
		pos = 0,
		magic = getFourCC(),
		version = getUint16(),
		channels, compression,
		width, height, depth, mode, modeDesc,
		colChunk, iresChunk, layersChunk,
		startTime = performance ? performance.now() : Date.now(),
		info = this.info;

	me._isp = true;

	/**
	 * Locate a resource in the resource chunk using the ID of it.
	 * If none is found, null is returned. The object returned otherwise
	 * contains a `pos` reference to position in buffer, `length` for length
	 * of resource data and a `name` if any.
	 * @type {number}
	 */
	this.findResource = findResource;

	// check magic keyword and version (should be 1)
	if (magic !== "8BPS" && version !== 1) {
		_err("Not a PSD file");
		return
	}

	// check reserved space (6 bytes should be 0)
	if (getUint32() || getUint16()) {
		_err("Not a valid PSD file");
		return
	}

	addChunk("Header", 14);

	channels = getUint16();
	if (!channels || channels > 56) {
		_err("Invalid channel count");
		return
	}

	height = getUint32();		// note: height comes before width
	width = getUint32();
	if (!width || width > 30000 || !height || height > 30000) {
		_err("Invalid size");
		return
	}

	depth = getUint16();
	if ([1,8,16,32].indexOf(depth) < 0) {
		_err("Invalid depth");
		return
	}

	mode = getUint16();
	if (mode > 15) {
		_err("Invalid color mode");
		return
	}
	modeDesc = ["Bitmap", "Greyscale", "Indexed", "RGB", "CMYK", "HSL", "HSB",
				"Multichannel", "Duotone", "Lab", "Greyscale16", "RGB48","LAB48",
				"CMYK64","DeepMultichannel","Duotone16"][mode];


	// store as public info object
	info.channels = channels;
	info.width = width;
	info.height = height;
	info.depth = depth;
	info.byteWidth = depth / 8;
	info.colorMode = mode;
	info.colorDesc = modeDesc;
	info.channelSize = width * height * info.byteWidth;

	// Color Mode Data, will be 0 for most mode except indexed and duotone
	colChunk = getUint32();
	addChunk("ColorModeData", colChunk);
	pos += colChunk;

	if ((mode === 2 || mode === 8) && colChunk === 0) {
		_err("Invalid data for mode.");
		return
	}

	// Image Resource section
	iresChunk = getUint32();
	addChunk("ImageResource", iresChunk);
	pos += iresChunk;

	// Layers and Mask section
	layersChunk = getUint32();
	addChunk("LayersAndMasks", layersChunk);
	pos += layersChunk;

	// Image Data section
	addChunk("ImageData", view.buffer.byteLength - pos);
	compression = getUint16();

	info.compression = compression;
	info.compressionDesc = ["Uncompressed", "RLE", "ZIP", "ZIP"][compression];

	switch(compression) {
		case 0:	// _raw
			me._raw(view, pos, info, convert);
			break;
		case 1:	// rle
			me._rle(view, pos, info, convert);
			break;
		case 2:	// zip no-prediction - possibly LZ77 stream.. no test files to be found...
		case 3:	// zip
			_err("Unsupported compression");
			break;
	}

	function convert() {me._cfg.noRGBA ? cbLoad(null) : me._toRGBA(cbLoad)}
	function cbLoad(bmp) {

		me._gamma(bmp);
		me.rgba = bmp;
		me.isParsed = true;
		me._isp = false;

		if (me.onload) me.onload({
			timeStamp: Date.now(),
			elapsed: (performance ? performance.now() : Date.now()) - startTime
		})
	}

	// temp: find a resource of a certain ID,
	// returns abs. position in buffer to start of data
	function findResource(id) {

		/* todo This do a brute-force scan of resource chunks.
			will be rewritten to use chunk mode, stepping from
			chunk to chunk, map position, size, type and name.
			Then have findResource looking up that array instead.
			Currently only used for indexed mode transparency index
			which is ok, and it's fast with short sections, but if we
			need to access more chunks (ICC etc.) we should fix this..
		 */

		var chunk = info.chunks[2], u16, p = 0, l, v, idLSB;

		if (!chunk.length) return null;

		idLSB = (id>>>8) | ((id & 0xff)<<8);							// reverse byte-order of id, because:
		u16 = new Uint16Array(me.buffer, chunk.pos, chunk.length>>1);	// reads data as LSB
		l = u16.length;

		// - scan first for: 0x3842 (MSB) (first part of 8BIM header), always evenly aligned
		// - when found check that next is 0x494D (MSB) (..IM).
		// - then check next for resource ID (use global view for that)

		while(p < l) {
			v = u16[p++];
			if (v === 0x4238) {
				v = u16[p++];
				if (v === 0x4d49) {
					// we got a 8BIM header, check id
					v = u16[p++];
					if (v === idLSB) {
						pos = u16.byteOffset + (p<<1);
						return {
							id: id,
							name: getString2(99),
							len: getUint32(),
							pos: pos
						}
					}
				}
			}
		}

		return null
	}

	/*
	Helpers
	 */
	function addChunk(name, length) {
		info.chunks.push({
			pos: pos,
			name: name,
			length: length
		})
	}

	function getUint8() {return view.getUint8(pos++)}

	function getUint16() {
		var v = view.getUint16(pos);
		pos += 2;
		return v>>>0;
	}

	function getUint32() {
		var v = view.getUint32(pos);
		pos += 4;
		return v>>>0;
	}

	/**
	 * Parse string from pos. pos will end on even boundary.
	 * If 0-length pos will be moved 2 byte positions
	 * @param {number} max - max number of bytes to scan for 0-termination
	 * @return {string}
	 * @private
	 */
	function getString2(max) {

		var str = "", ch = -1, i = 0, l;

		while(i++ < max && ch) {
			ch = getUint8();
			if (ch > 0) str += String.fromCharCode(ch);
		}

		l = str.length;
		if (!l || l % 2 === 0) pos++;

		return str
	}

	function getFourCC() {
		var v = getUint32(), c = String.fromCharCode;
		return c((v & 0xff000000)>>>24) + c((v & 0xff0000)>>>16) + c((v & 0xff00)>>>8) + c((v & 0xff)>>>0)
	}

	function _err(msg) {me._err(msg, "parser")}
};