/**
 * Converts already loaded and parsed PSD file to canvas. The canvas is
 * passed to the callback function when finished as part of the event.
 *
 * To access it:
 *
 *     function callback(e) {
 *         var canvas = e ? e.canvas : null;
 *         // or get the context:
 *         var context = e ? e.context : null;
 *         ...
 *     }
 *
 * If there was no bitmap to convert, e will be null.
 *
 * @param {function} callback - callback function to receive the result containing the canvas
 */
PsdReader.prototype.toCanvas = function(callback) {

	if (!this.rgba) {
		callback(null);
		return
	}

	var canvas = document.createElement("canvas"),
		ctx = canvas.getContext("2d"),
		idata;

	canvas.width = this.info.width;
	canvas.height = this.info.height;

	idata = ctx.createImageData(canvas.width, canvas.height);
	idata.data.set(this.rgba);
	ctx.putImageData(idata, 0, 0);

	callback({canvas: canvas, context: ctx, timeStamp: Date.now()});
};