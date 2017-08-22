'use strict';

const debug = require('debug')('test');
const readChunk = require('read-chunk');
const fileType = require('file-type');

const filePath = "/tmp/IMG_0252.jpg";

function testSync () {
    // The 4100 isn't a magic number; it's in the documentation for the package.
    const buffer = readChunk.sync(filePath, 0, 4100);
    const result = fileType(buffer);
    debug(" SYNC RESULT %O", result);
}

function testAsync () {
    readChunk(filePath, 0, 4100)
        .then(buffer => {
            const result = fileType(buffer);
            debug("ASYNC RESULT %O", result);
        })
}

testSync();
testAsync();

