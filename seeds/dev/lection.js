'use strict';

const Lection = require('../../models/Lection');

exports.seed = function (knex, Promise) {

    return Promise.all([
        knex('passage').del(),
        knex('pericope').del(),
        knex('reading').del(),
        knex('reading_type').del(),
        knex('lection').del(),
        knex('lection_type').del()
    ]).then(result => {
        return Promise.all([
            Lection.query().insertWithRelated({
                type: {
                    title: 'Semi-continuous',
                    "#id": 'lection-type-semi'
                },
                readings: [
                    {
                        seq: 1,
                        type: {
                            title: 'First Reading',
                            "#id": 'reading-type-first'
                        },
                        pericopes: [
                            {
                                passages: [
                                    {
                                        osis_ref: 'Hos.1.2-Hos.1.10',
                                        seq: 1,
                                        optional: false
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        seq: 2,
                        type: {
                            title: 'Psalm',
                            "#id": 'reading-type-psalm'
                        },
                        pericopes: [
                            {
                                passages: [
                                    {
                                        osis_ref: 'Ps.85',
                                        seq: 1,
                                        optional: false
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        seq: 3,
                        type: {
                            title: 'Second Reading',
                            "#id": 'reading-type-second'
                        },
                        pericopes: [
                            {
                                passages: [
                                    {
                                        osis_ref: 'Col.2.6-Col.2.15',
                                        seq: 1,
                                        optional: false
                                    },
                                    {
                                        osis_ref: 'Col.2.16-Col.2.19',
                                        seq: 2,
                                        optional: true
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        seq: 4,
                        type: {
                            title: 'Gospel',
                            "#id": 'reading-type-gospel'
                        },
                        pericopes: [
                            {
                                passages: [
                                    {
                                        osis_ref: 'Luke.11.1-Luke.11.13',
                                        seq: 1,
                                        optional: false
                                    }
                                ]
                            }
                        ]
                    }
                ]
            })
        ]);
    });
};
