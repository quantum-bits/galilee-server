'use strict';

import {initTest, expect, db} from './support';
const lab = exports.lab = initTest();

const Config = require('../models/Config');

lab.experiment('Configuration table', () => {

    lab.beforeEach(() => {
        return db.knex
            .raw('TRUNCATE public.config CASCADE')
            .then(() => {
                return Config
                    .query()
                    .insert([
                        {key: 'alpha', value: 'first'},
                        {key: 'beta', value: 'second'},
                        {key: 'gamma', value: 'third'}
                    ])
            });
    });

    lab.test('has the proper number of entries', () => {
        return Config
            .query()
            .then(results => {
                expect(results).to.be.an.array();
                expect(results).to.have.length(3);
                expect(results[1]).to.equal({key: 'beta', value: 'second'});
            });
    });

});
