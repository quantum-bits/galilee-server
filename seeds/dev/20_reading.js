 'use strict';

const uuid = require('uuid');

const ReadingDay = require('../../models/ReadingDay');

exports.seed = function (knex, Promise) {

    let today = new Date();

    return ReadingDay.query().insertGraph({
        date: '2016-02-02',
        directions: [
            {
                seq: 1,
                practice: {
                    title: "Engaging Scripture in Community",
                    summary: "What used to be the list of questions",
                    infoUrl: "https://www.biblegateway.com/resources/scripture-engagement"
                },
                steps: [
                    { seq: 1, description: 'What is your name?' },
                    { seq: 2, description: 'What is your quest?' },
                    { seq: 3, description: 'What is your favorite color?' }
                ]
            }
        ],
        readings: [
            {
                seq: 1,
                stdRef: 'Hosea 1.2-10',
                osisRef: 'Hos.1.2-Hos.1.10',
                directions: [
                    {
                        seq: 1,
                        practice: {
                            title: "Praying Scripture",
                            summary: "Summary of Praying Scripture",
                            infoUrl: "https://www.biblegateway.com/resources/scripture-engagement/praying-scripture/home"
                        }
                    },
                    {
                        seq: 2,
                        practice: {
                            title: "Lectio Divina",
                            summary: "Summary of Lectio Divina",
                            infoUrl: "https://www.biblegateway.com/resources/scripture-engagement/lectio-divina/home"
                        },
                        steps: [
                            {
                                seq: 1,
                                description: "Reading"
                            },
                            {
                                seq: 2,
                                description: "Meditation"
                            },
                            {
                                seq: 3,
                                description: "Prayer"
                            },
                            {
                                seq: 4,
                                description: "Contemplation"
                            },
                        ],
                    },
                    {
                        seq: 3,
                        practice: {
                            title: "Scripture Engagement Through Visual Art",
                            summary: "Summary of Scripture Engagement Through Visual Art",
                            infoUrl: "https://www.biblegateway.com/resources/scripture-engagement/art/home"
                        },
                        steps: [
                            {
                                seq: 1,
                                description: "Here's some art",
                                resources: [
                                    {
                                        id: uuid(),
                                        caption: 'Wedding at Cana',
                                        copyrightYear: 2006,
                                        copyrightOwner: 'Zondervan',
                                        tags: [
                                            {
                                                label: 'Miracle',
                                                "#id": 'resource-tag-miracle'
                                            },
                                            {
                                                label: 'Wedding',
                                            }
                                        ],
                                        type: {
                                            title: 'Image',
                                            icon: 'image-icon',
                                            "#id": 'resource-type-image'
                                        },
                                    }
                                ]
                            },
                            {
                                seq: 2,
                                description: "Here's some more art",
                                resources: [
                                    {
                                        id: uuid(),
                                        caption: 'Feeding 5,000',
                                        copyrightYear: 2012,
                                        copyrightOwner: 'Zondervan',
                                        tags: [
                                            {
                                                "#ref": 'resource-tag-miracle'
                                            },
                                            {
                                                label: 'Loaves'
                                            },
                                            {
                                                label: 'Fishes'
                                            }
                                        ],
                                        type: {
                                            "#ref": 'resource-type-image'
                                        }
                                    }
                                ]
                            }
                        ]
                    }
                ],
            },
            {
                seq: 2,
                stdRef: 'Psalm 85',
                osisRef: 'Ps.85',
                directions: [
                    {
                        seq: 1,
                        practice: {
                            title: "Journaling Scripture",
                            summary: "Summary of Journaling Scripture",
                            infoUrl: "https://www.biblegateway.com/resources/scripture-engagement/journaling-scripture/home"
                        }
                    }
                ]
            },
            {
                seq: 3,
                stdRef: 'Colossians 2.6-15',
                osisRef: 'Col.2.6-Col.2.15'
            }
        ]
    })
};
