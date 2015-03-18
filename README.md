﻿psd-reader
==========

Display Adobe&reg; Photoshop&reg; PSD files directly in the web browser.

- Use PSD files as an image source for canvas.
- Convert PSD to PNG or JPEG directly in the browser.
- Create slide-shows with support for PSD files.

[![demo snapshot](http://i.imgur.com/yQ4Irq2.png)](https://epistemex.github.io/psd-reader/psddrop.html)


Features
--------

- Fast and lightweight
- No dependencies
- Asynchronous and block-based decoding
- Reads: Greyscale, Bitmap, Indexed, RGB, CMYK, DuoTone, Multi-channel and Lab
- Supports alpha channel, and transparency for indexed mode
- All color depths supported (1 / 8 / 16 / 32 bits)
- De-matte of images with alpha-channel (no "halo" problems)
- Supports RLE compressed and uncompressed image data
- By default, converts all formats to RGBA so it can be used directly with canvas
- Canvas helper method with optional scaling and high-quality down-sampling
- Optional gamma correction
- By default, auto-corrects display gamma for 32-bit color mode
- Access to the original channel bitmaps (decompressed if needed)
- Access to raw meta and header data
- Access to resource chunks (incl. ID locator method)
- Passive load mode allowing parsing to be invoked manually later
- Validates and performs error checks
- Works in all major browsers (Firefox, Chrome, IE, Opera, Safari).
- An original parser implementation built from scratch.
- Fully documented (see docs folder or [this link](https://epistemex.github.io/psd-reader/docs/))


Demos
-----

Demos demonstrating capabilities of **psd-reader**.

*Note that some PSD files can be relative large in size so please be
patient when downloading the test images for the acid-test demo.*

**➜ [Acid-test - various color modes, formats and depths](https://epistemex.github.io/psd-reader/)**

**➜ [Built-in gamma correction](https://epistemex.github.io/psd-reader/demo_gamma.html)**

**➜ [Drop your own PSD files into the browser](https://epistemex.github.io/psd-reader/psddrop.html)**


Install
-------

Install **psd-reader** in various ways:

- Bower: `bower install psd-reader`
- Git using HTTPS: `git clone https://github.com/epistemex/psd-reader.git`
- Git using SSH: `git clone git@github.com:epistemex/psd-reader.git`
- Download [zip archive](https://github.com/epistemex/psd-reader/archive/master.zip) and extract.
- [psd-reader.min.js](https://raw.githubusercontent.com/epistemex/psd-reader/master/psd-reader.min.js)


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
        var canvas = this.toCanvas();
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

A modern and up-to-date "evergreen" browser with support for HTML5 and typed arrays.

There are no dependencies.


Limitations
-----------

These are generally non-problematic:

- PSD must be saved in (the typical) compatibility mode (see [tutorial section](https://epistemex.github.io/psd-reader/docs/tutorial-Compatibility%20Mode.html) in docs for details)
- ICC profiles are [not parsed/applied](https://epistemex.github.io/psd-reader/docs/tutorial-ICC.html)


Issues
------

See the [issue tracker](https://github.com/epistemex/psd-reader/issues) for details.

Please do report issues if you find any.


License
-------

Released under [MIT license](http://choosealicense.com/licenses/mit/). You may use this class in both commercial and non-commercial projects provided that full header (minified and developer versions) is included.


*&copy; 2015 Epistmex*

![Epistemex](http://i.imgur.com/YxO8CtB.png)
