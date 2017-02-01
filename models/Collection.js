'use strict';

const db = require('../db');

class Collection extends db.Model {
    allResources() {
        return this.resources.map(resource => {
            return {
                description: resource.description,
                url: resource.url,
                copyrightYear: resource.copyrightYear,
                copyrightOwner: resource.copyrightOwner,
                tags: resource.tags.map(tag => tag.title)
            }
        })
    }

    static get tableName() {
        return 'collection';
    }

    static get relationMappings() {
        return {
            resources: {
                relation: db.Model.ManyToManyRelation,
                modelClass: __dirname + '/Resource',
                join: {
                    from: 'collection.id',
                    through: {
                        from: 'collectionResource.collectionId',
                        to: 'collectionResource.resourceId'
                    },
                    to: 'resource.id'
                }
            },
            readings: {
                relation: db.Model.ManyToManyRelation,
                modelClass: __dirname + '/Reading',
                join: {
                    from: 'collection.id',
                    through: {
                        from: 'readingCollection.collectionId',
                        to: 'readingCollection.readingId',
                        extra: ['advice']
                    },
                    to: 'reading.id'
                }
            }
        }
    }

}

module.exports = Collection;
