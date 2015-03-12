
PsdReader.prototype._parser = function(buffer) {

	var me = this,
		view = new DataView(buffer),
		pos = 0,
		magic = getFourCC(),
		version = getUint16(),
		reserved, i, channels, compression,
		width, height, depth, mode, modeDesc,
		colChunk, iresChunk, layersChunk,
		startTime = performance ? performance.now() : Date.now(),
		info = this.info;

	this.findResource = findResource;

	// check magic header keyword
	if (magic !== "8BPS" && version !== 1) {
		this._err("Not PSD file.", "parser");
		return
	}

	// check reserved space
	for(reserved = getChars(6), i = 0; i < 6; i++) if (reserved[i]) {
		this._err("Not a valid PSD file.", "parser");
		return
	}

	addChunk("Header", 14);

	channels = getUint16();
	if (channels < 1 || channels > 56) {
		this._err("Invalid channel count.", "parser");
		return
	}

	height = getUint32();		// note: height comes before width
	width = getUint32();
	if (width < 1 || width > 30000 || height < 1 || height > 30000) {
		this._err("Invalid size.", "parser");
		return
	}

	depth = getUint16();
	if ([1,8,16,32].indexOf(depth) < 0) {
		this._err("Invalid depth.", "parser");
		return
	}

	mode = getUint16();
	if (mode < 0 || mode > 15) {
		this._err("Invalid color mode.", "parser");
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
		this._err("Invalid data for this mode.", "parser");
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
			this._raw(view, pos, info, convert);
			break;
		case 1:	// rle
			this._rle(view, pos, info, convert);
			break;
		case 2:	// zip no-prediction - possibly LZ77 stream.. no test files to be found...
		case 3:	// zip
			console.warn("If you come across this, consider sending us a specimen of this file for analysis.");
			break;
	}

	function convert() {me._toRGBA(cbLoad)}
	function cbLoad(bmp) {

		me._gamma(bmp);
		me.rgba = bmp;

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
			which is ok, and it's fast with short chunks, but if we
			need to access more chunks (ICC etc.) we should fix this..
		 */

		var chunk = info.chunks[2],
			u16, p = 0, l, v, idLSB;

		if (!chunk.length) return null;

		idLSB = ((id & 0xff00)>>>8) | ((id & 0xff)<<8);					// reverse byte-order of id
		u16 = new Uint16Array(me.buffer, chunk.pos, chunk.length>>>1);	// reads little-endian
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
							offset: pos,
							id: id,
							name: getString2(),
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
	/*function getInt8() {return view.getInt8(pos++)}*/	// these are left on purpose for a refactor later

	function getUint16() {
		var v = view.getUint16(pos);
		pos += 2;
		return v>>>0;
	}

	/*function getInt16() {
		var v = view.getInt16(pos);
		pos += 2;
		return v;
	}*/

	function getUint32() {
		var v = view.getUint32(pos);
		pos += 4;
		return v>>>0;
	}

	/*function getInt32() {
		var v = view.getInt32(pos);
		pos += 4;
		return v;
	}*/

	function getChars(len) {
		var chars = new Uint8Array(buffer, pos, len);
		pos += len;
		return chars
	}

	function getString2(max) {

		var str = "", ch = -1, i = 0;
		max = max || 255;

		while(i++ < max && ch) {
			ch = getUint8();
			if (ch > 0) str += String.fromCharCode(ch);
		}
		if (!str.length || str.length % 2 === 0) pos++;
		return str
	}

	function getFourCC(lsb) {
		var v = getUint32(),
			c = String.fromCharCode;

		return	lsb ?
				  c((v & 0xff)>>>0) + c((v & 0xff00)>>>8) + c((v & 0xff0000)>>>16) + c((v & 0xff000000)>>>24)
				  :
				  c((v & 0xff000000)>>>24) + c((v & 0xff0000)>>>16) + c((v & 0xff00)>>>8) + c((v & 0xff)>>>0);
	}
};