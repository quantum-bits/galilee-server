'use strict';

const debug = require('debug')('couchdb');

const PouchDB = require('pouchdb');
PouchDB.debug.enable('*');

PouchDB.plugin(require('pouchdb-find'));
PouchDB.plugin(require('pouchdb-adapter-memory'));

const db = new PouchDB('myDB', {adapter: 'memory'});

db.bulkDocs([
    {
        _id: 'user1',
        email: 'student@example.com',
        password: 'student-password',
        firstName: 'Jane',
        lastName: 'Student',
        joinedOn: '2017-01-04',
        enabled: true,
        version: {
            '#id': 'version-ver',
            code: 'VER',
            title: 'Version of the Bible'
        }
    },
    {
        _id: 'user2',
        email: 'admin@example.com',
        password: 'admin-password',
        firstName: 'June',
        lastName: 'Admin',
        joinedOn: '2017-02-04',
        enabled: true,
        version: {
            '#ref': 'version-ver'
        },
        permissions: [
            {
                id: 'ADMIN',
                title: 'Administrator'
            }
        ]
    }
]).then(response => {
    debug("RESPONSE %O", response);
}).then(() => {
    return db.allDocs({include_docs: true});
}).then(docs => {
    debug("ALL DOCS %O", docs);
}).catch(function (err) {
    console.log("ERROR", err);
});
