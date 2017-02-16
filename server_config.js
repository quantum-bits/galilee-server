// This file provides common access to server configuration information.

const nconf = require('nconf');

module.exports = nconf.file('./master.conf.json');
