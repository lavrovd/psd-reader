psd-reader
==========

Display Adobe&reg; Photoshop&reg; PSD files directly in the web browser,

Use PSD as an image source for canvas.

![demo snapshot](http://i.imgur.com/zMyiX2b.png)


Features
--------

- Fast and lightweight
- Asynchronous and block-based decoding
- Reads: Greyscale, Bitmap, Indexed, RGB, CMYK, DuoTone, Multi-channel and L*ab
- Support alpha channel, and transparency for indexed mode
- All color depths are supported (1 / 8 / 16 / 32 bits)
- Supports uncompressed and RLE compressed image data
- Converts all formats to RGBA so it can be used directly with canvas (can be turned off)
- Canvas helper methods with optional scaling and high-quality down-sampling
- Optional gamma correction (with separate gamma value for 32-bits - see gamma demo for why)
- Auto-corrects display gamma for 32-bit mode (can be turned off)
- Access to the original channel bitmaps (decompressed if needed)
- Access to raw meta and header data
- Passive load mode allowing parsing to be invoked manually later
- Validates and performs error checks
- Works in all major browsers (Firefox, Chrome, IE, Opera, Safari).
- It's an original implementation created from scratch.
- Fully documented (see docs folder or [this link](https://epistemex.github.io/psd-reader/docs/))


Demos
-----

Some demo demonstrating capabilities of psd-reader. Note that PSD files
aren't exactly the most web-friendly format size-wise, so please be
patient when downloading the test images.

Normally a PSD would be dropped in or loaded from the client side, but
for the sake of demo images here are loaded from server side:

**➜ [Acid-testing various color modes, formats and combinations](https://epistemex.github.io/psd-reader/)**

**➜ [Drop your own PSD files into the browser](https://epistemex.github.io/psd-reader/psddrop.html)**

**➜ [Gamma correction](https://epistemex.github.io/psd-reader/demo_gamma.html)**


Install
-------

**psd-reader** can be installed in various ways:

- Bower: `bower install psd-reader`
- Git using HTTPS: `git clone https://github.com/epistemex/psd-reader.git`
- Git using SSH: `git clone git@github.com:epistemex/psd-reader.git`
- Download [zip archive](https://github.com/epistemex/psd-reader/archive/master.zip) and extract.
- Right-click and download [psd-reader.min.js](https://raw.githubusercontent.com/epistemex/psd-reader/master/psd-reader.min.js)

Documentation
-------------

The project is fully documented and is available as html in the `docs` folder

**➜ [The documentation can be viewed online](https://epistemex.github.io/psd-reader/docs/)**

Tutorials and general information is included in the docs.


Usage
-----

Create a new instance, pass in an URL (or an array buffer), and a callback:

    var psd = new PsdReader({url: "path/to.psd", onLoad: myCallback});

In your callback you can access the RGBA data:

    function myCallback(e) {
        var bitmap = this.rgba;
    }

To get a canvas version of the data:

    function myCallback(e) {
        var canvas = psd.toCanvas();
        ...
    }

An already existing ArrayBuffer can be used instead of an URL:

    var psd = new PsdReader({buffer: psdArrayBuffer, onLoad: myCallback});

There is additional access to the original channel bitmap data in it´s native
format (ie. 8-bit, 16-bit etc.). The header information can be accessed
through the info object:

    var width     = psd.info.width;
    var height    = psd.info.height;
    var depth     = psd.info.depth;
    var channel0  = psd.info.bitmaps[0];	// in native format
    var resources = psd.info.chunks[1];		// the resource area
    ...


Requirements
------------

A modern "evergreen" browser with support for HTML5.


Limitations
-----------

These are generally non-problematic:

- PSD must be saved in the typical compatibility mode (see tutorial section in docs for details)
- ICC profiles are not parsed/applied


Issues
------

See the [issue tracker](https://github.com/epistemex/psd-reader/issues) for details.

Please do report issues if you find any.


License
-------

Released under [MIT license](http://choosealicense.com/licenses/mit/). You may use this class in both commercial and non-commercial projects provided that full header (minified and developer versions) is included.


*&copy; 2015 Epistmex*

![Epistemex](http://i.imgur.com/YxO8CtB.png)
