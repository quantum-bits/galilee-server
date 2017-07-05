'use strict';

/**
 * Set-up code for HAPI testing.  Use it like this:
 *
 * import { initTest, expect, server, db } from './support';
 * lab = exports.lab = initTest();
 *
 * lab.experiment(...);
 *
 * Apparently, hapi-lab requires that the test file itself export
 * the lab object itself to run properly.
 */

const masterConfig = require('../master-config');

const Code = require('code');
exports.expect = Code.expect;

const Server = require('../server');
exports.server = null;

exports.initTest = function () {
    const lab = require('lab').script();

    lab.before((done) => {
        Server.configureServer(masterConfig, null).then(server => {
            exports.server = server;
            server.log("Server initialized");
            done();
        })
    });

    return lab;
};

exports.db = require('../db');
