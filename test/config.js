'use strict';

import {init_test, expect, server, db} from './support';
const lab = exports.lab = init_test();

const Config = require('../models/Config');

lab.experiment('Configuration table', () => {

    lab.beforeEach(done => {
        return db.knex.raw('TRUNCATE public.config CASCADE')
            .then(result => {
                return Config
                    .query()
                    .insert([
                        {key: 'alpha', value: 'first'},
                        {key: 'beta', value: 'second'},
                        {key: 'gamma', value: 'third'}
                    ])
                    .catch(err => {
                        console.log('ERROR', err);
                    })
            })
    });

    lab.test('has the proper number of entries', done => {
        Config
            .query()
            .then(results => {
                expect(results).to.be.an.array();
                expect(results).to.have.length(3);
                expect(results[1]).to.equal({key: 'beta', value: 'second'});
                done();
            })
    });

});
