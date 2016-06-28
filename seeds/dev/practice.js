'use strict';

const Practice = require('../../models/Practice');

exports.seed = function (knex, Promise) {

    return knex('practice_detail').del()
        .then(result => knex('practice').del())
        .then(result => {
            return Promise.all([
                Practice
                    .query()
                    .insertWithRelated({
                        title: "Lectio Divina",
                        description: "Description of Lectio Divina",
                        details: [
                            {
                                title: "Lectio Divina Tips",
                                description: "Tips on Lectio Divina"
                            },
                            {
                                title: "Lectio Divina in a small group",
                                description: "Tips on Lectio Divina in a small group"
                            },
                            {
                                title: "Lectio Divina resources",
                                description: "Resources for Lectio Divina"
                            }
                        ]
                    }),

                Practice
                    .query()
                    .insertWithRelated({
                        title: "Praying Scripture",
                        description: "Description of Praying Scripture",
                        details: [
                            {
                                title: "Praying Scripture Tips",
                                description: "Tips on Praying Scripture"
                            },
                            {
                                title: "Praying Scripture in a small group",
                                description: "Tips on Praying Scripture in a small group"
                            },
                            {
                                title: "Praying Scripture resources",
                                description: "Resources for Praying Scripture"
                            }
                        ]
                    }),
                
                Practice
                    .query()
                    .insertWithRelated({
                        title: "Journaling Scripture",
                        description: "Description of Journaling Scripture",
                        details: [
                            {
                                title: "Journaling Scripture Tips",
                                description: "Tips on Journaling Scripture"
                            },
                            {
                                title: "Journaling Scripture in a small group",
                                description: "Tips on Journaling Scripture in a small group"
                            },
                            {
                                title: "Journaling Scripture resources",
                                description: "Resources for Journaling Scripture"
                            }
                        ]
                    })
            ])
        });
};