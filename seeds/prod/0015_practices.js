'use strict';

const debug = require('debug')('seed');
const fs = require('fs');

const Promise = require('bluebird');
Promise.promisifyAll(fs);

const markdown = require('../markdown');
const Practice = require('../../models/Practice');

exports.seed = function (knex, Promise) {
    debug("RUNNING PRACTICES");
    const dirName = __dirname + '/practices';
    return fs.readdirAsync(dirName).then(fileNames => {
        debug("%d FILES %O", fileNames.length, fileNames);

        return Promise.all(fileNames.map(fileName =>
            fs.readFileAsync(`${dirName}/${fileName}`, 'utf8').then(content => {
                const conversion = markdown.convertAll(content);

                return Practice.query().insert({
                    id: conversion.metaData.id,
                    title: conversion.metaData.title,
                    summary: conversion.html,
                    description: ''
                });
            })
        ));
    }).catch(err => new Error(err));
}
