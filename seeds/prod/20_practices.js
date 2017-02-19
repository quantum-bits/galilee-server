'use strict';

let fs = require('fs');

const Promise = require('bluebird');
Promise.promisifyAll(fs);

const marked = require('marked');
const debug = require('debug')('seed');

const Practice = require('../../models/Practice');

const dirName = __dirname + '/practices';

// Is 'line' blank?
function isBlankLine(line) {
    return /^\s*$/.test(line);
}

// Remove blank lines at the beginning of a list of lines.
function shiftBlankLines(lines) {
    while (lines && isBlankLine(lines[0])) {
        lines.shift();
    }
}

// Remove blank lines at the end of a list of lines.
function popBlankLines(lines) {
    while (lines && isBlankLine(lines[lines.length - 1])) {
        lines.pop();
    }
}

// Retrieve JSON metadata at the beginning of a list of lines.
function shiftMetaData(lines) {
    let metaData = {};

    if (/^\s*\{/.test(lines[0])) {
        // Looks like we have metadata.

        // Find the end of the metadata.
        const blankIdx = lines.findIndex(line => isBlankLine(line));
        if (blankIdx < 0) {
            throw new Error("No blank line found");
        }
        else if (blankIdx === 0) {
            throw new Error("Not really metadata here");
        }

        // Extract the metadata lines and skip trialing blank lines.
        const metaDataLines = lines.splice(0, blankIdx);
        shiftBlankLines(lines);

        // Convert to JSON.
        metaData = JSON.parse(metaDataLines.join(' '));
    }

    return metaData;
}

// Split content, trim whitespace, compress multiple spaces,
// remove blank lines at beginning and end.
function splitContent(content) {
    let lines = content
        .split('\n')
        .map(line => line.trim())
        .map(line => line.replace(/\s+/g, ' '));
    shiftBlankLines(lines);
    popBlankLines(lines);
    return lines;
}

// Convert markdown to HTML.
function convertToHtml(lines) {
    let md = marked(lines.join(' ')).trim();
    let html = `<div class="galilee">${md}</div>`;
    return html;
}

exports.seed = function (knex, Promise) {
    return fs.readdirAsync(dirName).then(fileNames => {
        debug("FILES %O", fileNames);

        return Promise.all(fileNames.map(fileName =>
            fs.readFileAsync(`${dirName}/${fileName}`, 'utf8').then(content => {
                let lines = splitContent(content);
                let metaData = shiftMetaData(lines);
                debug("META %O\nLINES %O", metaData, lines);

                return Practice.query().insert({
                    title: metaData.title,
                    summary: convertToHtml(lines),
                    description: ''
                });
            })
        ))
    }).catch(err => new Error(err));
};
