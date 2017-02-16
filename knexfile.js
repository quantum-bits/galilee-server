// This file is used by Knex for migrations.
// We hack in pieces of our broader configuration setup.

const config = require('./master-config');

module.exports = {
    development: config.get("development:db"),
    staging: config.get("staging:db"),
    production: config.get("production:db")
};
