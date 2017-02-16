// This file provides common access to server configuration information.

const nconf = require('nconf');

nconf.file('database', './public.conf.json');
nconf.file('secrets', './secret.conf.json');

module.exports = nconf;

// console.log("NCONF", nconf);
// console.log("CONFIG", JSON.stringify(nconf.get(), null, 4));