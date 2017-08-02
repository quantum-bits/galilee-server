# Galilee

Scripture Engagement Application: Server

## Install Node

Install the [LTS version of node](https://nodejs.org/)
(as of this writing version 6.10.3 is known to work).
If you don't already have node installed,
we recommend [nvm](https://github.com/creationix/nvm).

## Install Galilee

Clone the source code from Github:

    git clone https://github.com/quantum-bits/galilee-server.git

Install the Node modules configured into `package.json`:

    npm install
    
## Configure Galilee

Galilee supports PostgreSQL and MySQL.
Please refer to the documentation for your database and platform
for installation instructions.

Configuration data are stored in two files:
`public.conf.json` contains non-sensitive information
and is checked into revision control;
`secret.conf.json` contains sensitive information
(passwords, etc.)
and is _never_ checked in to revision control.
It's possible that some installations will want to move
configuration data from the public to the secret file
(e.g., hostnames).
Galilee first reads the `public.conf.json` file
and then the `secret.conf.json` file.
Overlapping content from the secret file
will overwrite content in the public file.
Either move configuration information from `public.conf.json`,
or simply leave it alone and override settings
you want to keep private in the `secret.conf.json` file.

The following snippet is an empty
copy of the `secret.conf.json` file
as of this writing.

The `developmment`, `staging`, and `production`
contain configuration information
used by the development and production
deployments of Galilee,
which has used PostgreSQL to date.
We have recently added support for
a MySQL backend.
It is configured in the `mysql` section.
Refer to [Configuring the Database]
for more information.

The `bg` section contains credentials for the
Bible Gateway API,
and the `esv` section for the Crossway API
for the English Standard Version. 

The API uses Javascript Web Tokens for
authentication.
The `jwt` entry should contain the secret key 
used to create tokens.

The developement team use [Slack](https://slack.com/)
for devops reporting. The `hook-url` entry
contains the Slack hook for this service.
Leaving it blank should be fine.

```json
{
  "development": {
    "db": {
      "connection": {
        "user": "",
        "password": ""
      }
    }
  },
  "staging": {
    "db": {
      "connection": {
        "user": "",
        "password": ""
      }
    }
  },
  "production": {
    "db": {
      "connection": {
        "user": "",
        "password": ""
      }
    }
  },
  "mysql": {
    "db": {
      "connection": {
        "user": "",
        "password": ""
      }
    }
  },
  "bg": {
    "username": "",
    "password": ""
  },
  "esv": {
	  "access-key": ""
  },
  "jwt-key": "",
  "slack": {
    "hook-url": ""
  }
}

```

## Configure the Database

The `developmment`, `staging`, `production`,
and `mysql` sections of the configuration files
must be set up to refer to the appropirate DBMS.

In the appropirate sections of the `public.conf.json` file,
set the following field values:

* `database`: database instance/schema name
* `host`: host name where the database is running
* `charset`: character (used by PostgreSQL)

In the appropirate sections of the `secret.conf.json` file,
set the following field values:

* `user`: database user account name
* `password`: database user password

## Initialize the Schema

From the command line, run
one of the following commands.
For `development`:
    
    npm run knex:migrate:dev

For `production`:

    npm run knex:migrate:prod

For `mysql`:

    npm run knex:migrate:mysql

This should create all the database tables.

## Load Fixture Data

From the command line, run
one of the following commands.

For `development`:
    
    npm run knex:seed:dev

For `production`:

    npm run knex:seed:prod

For `mysql`:

    npm run knex:seed:mysql

This should add sample data to the database.

## Run the Server

From the command line, run
one of the following commands.

For `development`:
    
    npm run start:dev

For `production`:

    npm run start:prod

For `mysql`:

    npm run start:mysql

This should fire up the server,
which will display a list of endpoints
and begin listening for requests.