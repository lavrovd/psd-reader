/*
	psd-reader - Fie buffer parser
	By Ken Fyrstenberg / Epistemex (c) 2015
	www.epistemex.com
*/

/**
 * Parse given buffer as PSD file buffer
 * @param buffer
 * @private
 */
PsdReader.prototype._parser = function(buffer) {

	var me = this,
		view = new DataView(buffer),
		pos = 0,
		conv,
		resParsed = false,
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

	/**
	 * Parse the resource chunk and make the result available in the
	 * info.resources array. The parsed data is a list of all resources
	 * available in the file, with properties, `id`, `name`, `size` and byte
	 * position `pos` in the buffer for the beginning of the resource data.
	 * The data itself is not parsed.
	 *
	 * Use `findResource(id)` to look for a resource with id.
	 *
	 * @type {function}
	 */
	this.parseResources = parseResources;

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
	if (!width || width > 3e4 || !height || height > 3e4) {
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

	if ([5,6,11,12,13,14,15].indexOf(mode) > -1) {
		_err("Unsupported color mode");
		return
	}

	modeDesc = [
		"Bitmap", "Greyscale", "Indexed", "RGB", "CMYK", "HSL", "HSB",
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
		_err("Missing data for mode");
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
	info.compressionDesc = ["Uncompressed", "RLE"][compression];	// zip is ignored (see below)

	conv = (compression ? me._rle : me._raw).bind(me);		// we ignore zip modes (1,2) as no PSD is found with it...
	conv(view, pos, info, convert);

	function convert() {me.config.toRGBA ? me._toRGBA(cbLoad) : cbLoad(null)}
	function cbLoad(bmp) {

		me.rgba = bmp;
		me.isParsed = true;
		me._isp = false;

		if (me.onload) me.onload({
			timeStamp: Date.now(),
			elapsed: (performance ? performance.now() : Date.now()) - startTime
		})
	}

	function findResource(id) {

		var resources = me.resources, i = 0, res;
		if (!resParsed) parseResources();

		while(res = resources[i++]) if (res.id === id) return res;
		return null
	}

	function parseResources() {

		var chunk = info.chunks[2], l, res = me.resources, size;

		if (!chunk.length) return;

		pos = chunk.pos;
		l = pos + chunk.length;
		resParsed = true;

		while(pos < l) {
			if (getFourCC() === "8BIM") {
				res.push({
					id: getUint16(),
					name: getString2(256),
					size: (size = getUint32()),
					pos: pos
				});
				pos += size % 2 === 0 ? size : size + 1;
			}
			else return;
		}
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