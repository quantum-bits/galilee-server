"use strict";

const masterConfig = require('./master-config');
const BibleService = require('./lib/bible');
const Server = require('./server');

new BibleService(masterConfig)
    .then(bibleService => {
        Server.configureServer(masterConfig, bibleService)
            .then(server =>
                server.start(err => {
                    if (err) {
                        throw err;
                    }
                    server.log('info', 'Server running at ' + server.info.uri);
                }));
    });
