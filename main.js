"use strict";

const Server = require('./server');

Server.initializeServer().then(server => {
    server.start(err => {
        if (err) {
            throw err;
        }
        server.log('info', 'Server running at ' + server.info.uri);
    });
});
