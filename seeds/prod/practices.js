'use strict';

let fs = require('fs');

const Promise = require('bluebird');
Promise.promisifyAll(fs);

const marked = require('marked');

const Practice = require('../../models/Practice');

const dirName = __dirname + '/practices';

// Remove blank lines at the beginning of a list of lines.
function shiftBlankLines(lines) {
    while (lines && /^\s*$/.test(lines[0])) {
        lines.shift();
    }
}

exports.seed = function (knex, Promise) {
    return fs.readdirAsync(dirName).then(fileNames => {
        console.log(fileNames);
        return Promise.all(fileNames.map(fileName =>
            fs.readFileAsync(`${dirName}/${fileName}`, 'utf8').then(contents => {
                let lines = contents.split('\n');
                let title = "Unknown";

                shiftBlankLines(lines);

                if (lines) {
                    title = lines.shift();
                    title = title.replace(/^#\s*/, '');
                }

                shiftBlankLines(lines);

                return Practice.query().insert({
                    title: title,
                    summary: marked(lines.join('\n')),
                    description: ''
                });
            })
        ))
    }).catch(err => new Error(err));
};
