'use strict';

const uuid = require('uuid');

const ReadingDay = require('../../models/ReadingDay');

exports.seed = function (knex, Promise) {

    return Promise.all([
        knex('resource_tag').del(),
        knex('practice_resource').del(),
        knex('collection_resource').del(),
        knex('reading_practice').del(),
        knex('reading_collection').del()

    ]).then(() => Promise.all([
        knex('resource').del(),
        knex('practice').del(),
        knex('collection').del(),
        knex('reading').del(),
        knex('tag').del()

    ])).then(() => Promise.all([
        knex('resource_type').del(),
        knex('reading_day').del()

    ])).then(() => ReadingDay.query().insertWithRelated({
        date: '2016-12-28',
        readings: [
            {
                seq: 1,
                std_ref: 'Hosea 1.2-10',
                osis_ref: 'Hos.1.2-Hos.1.10',
                practices: [
                    {
                        title: "Praying Scripture",
                        description: "Description of Praying Scripture",
                        advice: "Here's how"
                    },
                    {
                        title: "Lectio Divina",
                        description: "Description of Lectio Divina",
                        advice: "Here's how",
                        resources: [
                            {
                                id: uuid(),
                                details: {
                                    url: 'https://www.biblegateway.com/resources/scripture-engagement/lectio-divina/home'
                                },
                                caption: 'More Information',
                                type: {
                                    title: 'Link',
                                    icon: 'link-icon',
                                    "#id": 'resource-type-link'
                                }
                            }
                        ]
                    }
                ],
                collections: [
                    {
                        id: uuid(),
                        title: 'Miracles',
                        description: 'Paintings of miracles',
                        advice: 'Consider these paintings',
                        resources: [
                            {
                                id: uuid(),
                                details: {
                                    filename: 'cana.png'
                                },
                                caption: 'Wedding at Cana',
                                copyright_year: 2006,
                                copyright_owner: 'Zondervan',
                                tags: [
                                    {
                                        title: 'Miracle',
                                        "#id": 'resource-tag-miracle'
                                    },
                                    {
                                        title: 'Wedding',
                                    }
                                ],
                                type: {
                                    title: 'Image',
                                    icon: 'image-icon',
                                    "#id": 'resource-type-image'
                                },
                            },
                            {
                                id: uuid(),
                                details: {
                                    filename: 'feeding5000.jpeg'
                                },
                                caption: 'Feeding 5,000',
                                copyright_year: 2012,
                                copyright_owner: 'Zondervan',
                                tags: [
                                    {
                                        "#ref": 'resource-tag-miracle'
                                    },
                                    {
                                        title: 'Loaves'
                                    },
                                    {
                                        title: 'Fishes'
                                    }
                                ],
                                type: {
                                    "#ref": 'resource-type-image'
                                }
                            }

                        ]
                    }
                ]
            },
            {
                seq: 2,
                std_ref: 'Psalm 85',
                osis_ref: 'Ps.85',
                practices: [
                    {
                        title: "Journaling Scripture",
                        description: "Description of Journaling Scripture",
                        advice: "Here's how"
                    }
                ]
            },
            {
                seq: 3,
                std_ref: 'Colossians 2.6-15',
                osis_ref: 'Col.2.6-Col.2.15',
            }
        ]
    }))
};