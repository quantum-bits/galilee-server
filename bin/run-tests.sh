#!/usr/bin/env bash

DEBUG_DEPTH=4 \
DEBUG=test,knex:query,knex:bindings \
GALILEE=development \
./node_modules/.bin/lab \
    --verbose \
    --transform node_modules/lab-babel \
    --sourcemaps \
    --globals __core-js_shared__ \
    --grep "$*"
