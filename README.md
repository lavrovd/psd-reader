psd-reader
==========

Read Adobe&reg; Photoshop&reg; PSD files so they can be shown in the web browser. That's it! :-)


Features
--------

- Fast and lightweight
- Asynchronous and block-based decoding (no UI-blocking when reading large files)
- Reads greyscale, bitmap, indexed, RGB, CMYK, DuoTone, multi-channel and Lab
- Support alpha channel as well as transparency for indexed mode
- All color depths (1/8/16/32 bits) are supported
- Support uncompressed and RLE compressed image data
- Converts all formats to RGBA so it can be used directly with canvas
- Canvas support with dedicated method supporting scaling and high-quality down-sampling
- Optional gamma correction (with separate gamma values for 32-bits and one for all others)
- Auto-corrects display gamma for 32-bit mode
- Access to the original channel bitmaps
- Access to meta and header data
- Validates and performs error checks
- Passive load mode allowing parsing to be invoked manually later
- Event driven (onready, onload, onerror).
- Works in all major browsers (Firefox, Chrome, IE, Opera, Safari).
- It's an original implementation created from scratch.
- Fully documented (see docs folder)


Demos
-----

**➜ [Acid-testing various color modes, format and combinations](https://epistemex.github.io/psd-reader/)**

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


Usage
-----

It's simple to use, create a new instance, provide an URL and callback:

    var psd = new PsdReader({url: "path/to.psd", onLoad: myCallback});

In your callback you can access the RGBA data:

    function myCallback(e) {
        var bitmap = this.rgba;
    }

If you want a canvas version, a single call will do it:

    function myCallback(e) {
        var canvas = psd.toCanvas();
        ...
    }


You have additional access to the original channel data in it´s native
format (ie. 8-bit, 16-bit etc.) as well as an info object.

    var info     = psd.info:
    var width    = info.width;
    var height   = info.height;
    var depth    = info.depth;
    var channel0 = info.bitmaps[0];		// in native format
    ...

It's possible to use an already existing ArrayBuffer loaded from a
different source (ie. FileReader API, XHR):

    var psd = new PsdReader({buffer: myArrayBuffer, onLoad: myCallback});

Requirements
------------

A modern "evergreen" browser with support for HTML5.


Limitations
-----------

We consider these generally non-problematic, but for convenience:

- The PSD file must be saved in *compatibility mode* (the typical save mode)
- Does not apply ICC to the color data (affects CMYK files in particular).
- DuoTone and L*ab are included for preview purpose only.
- The goal and purpose of this project is not to parse and render individual layers and masks.


Issues
------

See the [issue tracker](https://github.com/epistemex/psd-reader/issues) for details.

Please do report issues if you find any.


License
-------

Released under [MIT license](http://choosealicense.com/licenses/mit/). You may use this class in both commercial and non-commercial projects provided that full header (minified and developer versions) is included.


*&copy; 2015 Epistmex*

![Epistemex](http://i.imgur.com/YxO8CtB.png)
