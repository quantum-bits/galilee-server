// This file provides common access to server configuration information.

const _ = require('lodash');
const debug = require('debug')('config');

const nconf = require('nconf');

nconf.env(['GALILEE']);
nconf.file('database', './public.conf.json');
nconf.file('secrets', './secret.conf.json');

// Make sure we have a GALILEE environment variable.
const envName = nconf.get('GALILEE');
if (!envName) {
    throw Error("No GALILEE environment variable");
}

// Pull values from the selected environment into the top level
const selectedEnv = nconf.get(envName);
if (!selectedEnv) {
    throw Error(`No Galilee environment '${selectedEnv}'`);
}

_.forEach(selectedEnv, (v, k) => nconf.set(k, v));

debug("NCONF %O", nconf);
debug("CONFIG %O", nconf.get());

module.exports = nconf;
