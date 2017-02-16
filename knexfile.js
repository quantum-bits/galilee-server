const config = require('./server_config');

module.exports = {

    development: {
        client: 'pg',
        connection: {
            database: 'galilee',
            host: 'localhost',
            user: config.get('pg:development:user'),
            password: config.get('pg:development:password'),
            charset: 'utf8'
        },
        seeds: {
            directory: './seeds/dev'
        },
        // debug: true
    },

    staging: {
        client: 'postgresql',
        connection: {
            database: 'galilee',
            host: 'localhost',
            user: config.get('pg:staging:user'),
            password: config.get('pg:staging:password'),
            charset: 'utf8'
        },
        seeds: {
            directory: './seeds/dev'
        },
        pool: {
            min: 2,
            max: 10
        }
    },

    production: {
        client: 'postgresql',
        connection: {
            database: 'galilee',
            user: config.get('pg:production:user'),
            password: config.get('pg:production:password'),
        },
        pool: {
            min: 2,
            max: 10
        }
    }

};
