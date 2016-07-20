'use strict';

const Lection = require('../../models/Lection');

exports.seed = function (knex, Promise) {

    return knex('lection_type').del()
        .then(result => {
            return Promise.all([
                Lection
                    .query()
                    .insertWithRelated({
                        lection_type: {
                            title: 'Semi-continuous',
                            '#id': 'lection-type-semi'
                        }
                    })
            ]);
        });
};
