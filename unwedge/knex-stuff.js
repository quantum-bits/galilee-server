'use strict';

const ACCESS_TOKEN_KEY = 'bg-access-token';

const Config = require('../models/Config');

function delete_access_token() {
    return Config.query()
        .delete()
        .where('key', ACCESS_TOKEN_KEY);
}

function insert_access_token(new_token) {
    return Config.query()
        .insert({key: ACCESS_TOKEN_KEY, value: new_token});
}

function select_access_token() {
    return Config.query()
        .where('key', ACCESS_TOKEN_KEY);
}

function get_access_token() {
    return select_access_token().then(rows => {
        if (rows.length === 1) {
            return rows[0].value;
        } else {
            return null;
        }
    });
}

function set_access_token(new_token) {
    return delete_access_token().then(row_count => {
        return insert_access_token(new_token);
    });
}

console.log("BEFORE");
set_access_token('zorro')
    .then(row => {
        console.log("NEW", row);
        get_access_token().then(token => {
            console.log("TOKEN", token);
        }).finally(process.exit(0));
    });
