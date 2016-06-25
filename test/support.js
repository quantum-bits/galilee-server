'use strict';

/**
 * Set-up code for HAPI testing.  Use it like this:
 *
 * import { init_test, expect, server, db } from './support';
 * lab = exports.lab = init_test();
 *
 * lab.experiment(...);
 *
 * Apparently, hapi-lab requires that the test file itself export
 * the lab object itself to run properly.
 */

const Hoek = require('hoek');

const Lab = require('lab');

const Code = require('code');
exports.expect = Code.expect;

const Server = require('../server');
exports.server = null;

exports.init_test = function() {
    const lab = Lab.script();

    lab.before((done) => {
        Server((err, server) => {
            if (err) {
                Hoek.assert(!err, err);
            }
            server.initialize(err => {
                Hoek.assert(!err, err);
            });
            exports.server = server;
            server.log("Server initialized");
            done();
        })
    });

    return lab;
}

exports.db = require('../db');
