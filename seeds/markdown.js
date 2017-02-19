'use strict';

const marked = require('marked');
const debug = require('debug')('seed');

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
    // Join lines with newline, so markdown can find paragraphs.
    let md = marked(lines.join('\n')).trim();

    // Wrap in a class for styling.
    let html = `<div class="galilee">${md}</div>`;
    return html;
}

// Do all the conversion.
function convertAll(content) {
    let lines = splitContent(content);
    let metaData = shiftMetaData(lines);
    let html = convertToHtml(lines);

    return {
        metaData: metaData,
        html: html
    };
}

exports.convertAll = convertAll;

exports.convertHtml = function(content) {
    const conversion = convertAll(content);
    return conversion.html;
}
