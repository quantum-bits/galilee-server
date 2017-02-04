module.exports = {

    development: {
        client: 'pg',
        connection: {
            host: 'localhost',
            user: 'galilee',
            password: 'pass',
            database: 'galilee',
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
            database: 'my_db',
            user: 'username',
            password: 'password'
        },
        pool: {
            min: 2,
            max: 10
        },
        migrations: {
            tableName: 'knex_migrations'
        }
    },

    production: {
        client: 'postgresql',
        connection: {
            database: 'my_db',
            user: 'username',
            password: 'password'
        },
        pool: {
            min: 2,
            max: 10
        },
        migrations: {
            tableName: 'knex_migrations'
        }
    }

};
