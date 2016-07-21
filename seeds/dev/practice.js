'use strict';

const Practice = require('../../models/Practice');
const Collection = require('../../models/Collection');

exports.seed = function (knex, Promise) {

    return knex('practice').del()
        .then(result => {
            return Promise.all([
                Practice.query().insertWithRelated({
                    title: "Lectio Divina",
                    description: "Description of Lectio Divina",
                    resources: [
                        {
                            description: 'More Information',
                            url: 'https://www.biblegateway.com/resources/scripture-engagement/lectio-divina/home',
                            type: {
                                title: 'Link',
                                icon: 'link-icon',
                                "#id": 'resource-type-link'
                            }
                        }
                    ]
                }),

                Practice.query().insertWithRelated({
                    title: "Praying Scripture",
                    description: "Description of Praying Scripture"
                }),

                Practice.query().insertWithRelated({
                    title: "Journaling Scripture",
                    description: "Description of Journaling Scripture"
                }),

                Collection.query().insertWithRelated({
                    title: 'Miracles',
                    description: 'Paintings of miracles',
                    resources: [
                        {
                            description: 'Wedding at Cana',
                            url: 'file://wedding.png',
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
                            description: 'Feeding 5,000',
                            url: 'file://loaves-and-fishes.png',
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
                })
            ])
        });
};
