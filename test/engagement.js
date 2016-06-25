'use strict';

import {init_test, expect, server, db} from './support';
const lab = exports.lab = init_test();

const Practice = require('../models/Practice');

lab.experiment('Test engagement endpoints', () => {

    lab.beforeEach(done => {
        return db.knex.raw('TRUNCATE public.practice CASCADE')
            .then(result => {
                return Practice
                    .query()
                    .insertWithRelated({
                        title: "Lectio Divina",
                        description: "Description of Lectio Divina",
                        details: [
                            {
                                title: "Lectio tips",
                                description: "Tips on Lectio Divina"
                            },
                            {
                                title: "Lectio for a group",
                                description: "Tips on Lectio Divina in group context"
                            }
                        ]
                    })
                    .catch(err => {
                        console.log('ERROR', err);
                    })
            })
    });


    lab.test('Fetch all practices', done => {
        server.inject(
            {
                method: 'GET',
                url: '/practices',
                credentials: {}
            }, res => {
                expect(res.statusCode).to.equal(200);
                const response = JSON.parse(res.payload);
                console.log("RES", JSON.stringify(response, null, 4));
                expect(response[0].details).to.have.length(2);
                done();
            });
    });


});
