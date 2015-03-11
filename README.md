psd-reader
==========

Read and show Photoshop PSD files in the browser.

This project's only goal is to read the merged bitmap of the file so its
data can be used with canvas or for displaying.

It does not have the goal of parsing layers, masks, resources and so forth
(although, we do work on another project for this).


Features
--------

- Fast and lightweight!
- Asynchronous decoding (no UI-blocking when reading large files)
- Reads greyscale, indexed, RGB, CMYK, multi-channel and Lab including alpha-channel
- Any supported depth 1/8/16/32 bits
- Support uncompressed and RLE compressed image data
- Converts all formats to RGBA so it can be used directly with canvas (convenience method to convert to canvas included).
- Access to individual channel bitmaps
- Corrects display gamma for 32-bits data
- Access to meta and header data
- Validates and error checks
- Cross-Origin support
- Works in all major browsers (Firefox, Chrome, IE, Opera, Safari).

##[Click here to see psd-reader in action](https://epistemex.github.io/psd-reader/)

##[PSD file drop demo](https://epistemex.github.io/psd-reader/psddrop.html)


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


Limitations
-----------

- The original Photoshop PSD file must be saved in *compatibility mode* (the typical save mode)
- Does not apply ICC to color data (you get the raw channel bitmaps - affects CMYK/L*ab files in particular).


Known Issues
------------

- Duotone doesn't parse yet (lack of official documentation on the format)
- LAB to RGB produce incorrect colors (currently uses D65/2°. Should use D50/10° as well as ICC).


License
-------

Released under [MIT license](http://choosealicense.com/licenses/mit/). You may use this class in both commercial and non-commercial projects provided that full header (minified and developer versions) is included.


*&copy; 2015 Epistmex*

![Epistemex](http://i.imgur.com/YxO8CtB.png)
