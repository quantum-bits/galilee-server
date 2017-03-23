'use strict';

const Request = require('superagent');
const debug = require('debug')('bg');
const moment = require('moment');
const assert = require('assert');
const Promise = require('bluebird');

const DevOps = require('./devOps');
const Config = require('../models/Config');
const Version = require('../models/Version');

const BG_API_BASE_URL = 'https://api.biblegateway.com/3';
const ESV_API_BASE_URL = 'http://www.esvapi.org/v2/rest';

// Important note on terminology:
// "Translation" refers to information from the various Bible APIs (e.g., Bible Gateway, Crossway),
// "Version" refers to a Galilee Version object and includes information from a translations
//     as well as (importantly) the appropriate Version.id field from the database.
// As an example of the distinction, we fetch _translation_ information from Bible Gateway, and
// convert it to _version_ information in the BibleService.

class BibleService {
    constructor(masterConfig) {
        this.bibleGatewayService = null;
        this.crosswayService = null;

        this.authorizedVersions = [];   // All available versions
        this.defaultVersion = null;     // Default version

        return new BibleGatewayService(masterConfig).then(bgService => {
            this.bibleGatewayService = bgService;
            return this._cacheAuthorizedVersions(bgService);
        }).then(() => {
            return new CrosswayService(masterConfig).then(crosswayService => {
                this.crosswayService = crosswayService;
                return this._cacheAuthorizedVersions(crosswayService);
            })
        }).then(() => {
            debug("Authorized versions %O", this.authorizedVersions);
            this._setDefaultVersion();
            return this;
        });
    }

    // Load or create a Galilee Version object for the given translation.
    _cacheAuthorizedVersion(translation) {
        debug("Cache %O", translation);
        return Version.query()
            .where('code', translation.code)
            .first()
            .then(version => {
                if (version) {
                    debug("%o already in DB", translation.code);
                    return version;
                } else {
                    debug("Insert %o into DB", translation.code);
                    return Version.query().insertAndFetch({
                        code: translation.code,
                        title: translation.title
                    });
                }
            });
    }

    // Load or create all Galilee Version objects for indicated service.
    _cacheAuthorizedVersions(service) {
        return Promise.map(service.authorizedTranslations, translation => {
            return this._cacheAuthorizedVersion(translation).then(version => {
                version.service = service;
                version.last_modified = translation.last_modified;
                return version;
            });
        }).then(allVersions => {
            debug("All versions %O", allVersions);
            this.authorizedVersions = this.authorizedVersions.concat(allVersions);
            return allVersions;
        });
    }

    // Figure out an authorized default version.
    _setDefaultVersion() {
        return Config.getDefaultVersion().then(config => {
            const defaultVersionCode = config.value;
            debug("Default version from config %o", defaultVersionCode);

            this.defaultVersion = this.findVersionByCode(defaultVersionCode);
            if (this.defaultVersion) {
                debug("Using configured default (%o)", this.defaultVersion.code);
                return true;
            } else {
                // Default version is not authorized.
                // From the authorized BG versions, pick the newest.
                const newestVersion = this.authorizedVersions.reduce((a, b) => {
                    return a.last_modified.isAfter(b.last_modified) ? a : b;
                });
                const temporaryDefault = this.findVersionByCode(newestVersion.code);

                // Construct and broadcast error message.
                const availableVersions = this.authorizedVersions.map(version =>
                    `  ${version.code} (${version.last_modified.format('YYYY-MM-DD')})`).join("\n");
                const message = [
                    `Licensed for these versions:\n${availableVersions}.\n`,
                    `Default version (${defaultVersionCode}) isn't licensed;`,
                    `using ${temporaryDefault.code} instead.`,
                    'Update default version in database.'].join(' ');
                debug(message);
                DevOps.notifyWarning(message);

                // Set the default for the time being.
                this.defaultVersion = temporaryDefault;
                return false;
            }
        });
    }

    findVersionByCode(versionCode) {
        return this.authorizedVersions.find(version => version.code == versionCode);
    }

    findVersionById(versionId) {
        return this.authorizedVersions.find(version => version.id == versionId);
    }

    getAuthorizedVersions() {
        return this.authorizedVersions.map(translation => ({
            id: translation.id,
            code: translation.code,
            title: translation.title
        }));
    }

    fetchPassage(versionCode, osisRef) {
        let version = this.findVersionByCode(versionCode);
        assert(version, `No version for code ${versionCode}`);
        assert(version.service, `No service for code ${versionCode}`);

        return version.service.fetchPassage(versionCode, osisRef);
    }
}

class BibleGatewayAuthService {
    constructor(masterConfig) {
        debug("Initialize BibleGateway auth service")

        this.valid = false;
        this.userId = null;
        this.accessToken = null;
        this.receivedAt = null;
        this.expiresAt = null

        return new Promise((resolve, reject) => {
            Request
                .post(`${BG_API_BASE_URL}/user/authenticate`)
                .type('form')
                .send({
                    username: masterConfig.get('bg:username'),
                    password: masterConfig.get('bg:password')
                })
                .accept('json')
                .then(response => {
                    const body = response.body;
                    if (body.hasOwnProperty('authentication')) {
                        this.valid = body.authentication.success;
                        this.userId = body.authentication.user_id;
                        this.accessToken = body.authentication.access_token;
                        this.expiresAt = moment.unix(body.authentication.expires);
                        this.receivedAt = moment();
                        debug("Init complete %O", this);
                        resolve(this);
                    } else {
                        reject('Response has no authentication information');
                    }
                });
        });
    }

    isExpired() {
        return (this.receivedAt.add(1, 'hours').isAfter(this.expiresAt));
    }

    isAuthenticated() {
        return (this.valid && !this.isExpired());
    }

    getAccessToken() {
        return this.accessToken;
    }
}

class BibleGatewayService {
    constructor(masterConfig) {
        debug("Initialize BibleGateway service")
        this.authService = null;

        // List of translations for which we're authorized. Sample:
        // [ { code: 'MSG', title: 'The Message', date: 2017-03-22 }, ... ]
        this.authorizedTranslations = [];

        return new BibleGatewayAuthService(masterConfig).then(authService => {
            this.authService = authService;
            return new Promise((resolve, reject) => {
                this._fetchTranslations().then(translations => {
                    this.authorizedTranslations = translations
                    debug("Init complete %O", this);
                    return resolve(this);
                });
            });
        });
    }

    // Retrieve detailed version information from BG.
    _fetchTranslationInfo(version) {
        debug("Get version info from BG for %o", version);
        return Request.get(`${BG_API_BASE_URL}/bible/${version}`)
            .query({access_token: this.authService.getAccessToken()})
            .then(resp => resp.body.data[0]);
    }

    // Fetch versions for which we're authorized on BG.
    _fetchTranslations() {
        debug("Fetch BG versions");
        return Request
            .get(`${BG_API_BASE_URL}/bible`)
            .query({access_token: this.authService.getAccessToken()})
            .accept('json')
            .then(xlationJson => {
                const xlations = xlationJson.body.data;
                return Promise.map(xlations, xlation => {
                    return this._fetchTranslationInfo(xlation.translation).then(xlationDetail => {
                        return {
                            code: xlationDetail.attribution.translation,
                            title: xlationDetail.attribution.translation_name,
                            last_modified: moment(xlation.last_modified)
                        };
                    });
                });
            });
    }

    // Fetch a passage. Handles simple ranges as well as multiple discontinuous ranges.
    fetchPassage(versionCode, osisRef) {
        debug("Get %o from %o", osisRef, versionCode);
        return Request.get(`${BG_API_BASE_URL}/bible/${osisRef}/${versionCode}`)
            .query({
                access_token: this.authService.getAccessToken()
            })
            .then(resp => resp.body.data.map(datum => datum.passages[0].content).join("\n"));
    }
}

class CrosswayService {
    constructor(masterConfig) {
        this.accessKey = masterConfig.get('esv:access-key');
        this.authorizedTranslations = [
            {code: 'ESV', title: 'English Stadard Version', date: moment()}
        ];

        debug("Initialize Crossway service")
        return new Promise.resolve(this);
    }

    fetchPassage(versionCode, osisRef) {
        debug("Get %o from %o", osisRef, versionCode);
        debug("%O", this);
        return Request.get(`${ESV_API_BASE_URL}/passageQuery`)
            .query({
                key: this.accessKey,
                passage: osisRef
            })
            .then(resp => {
                debug("RESPONSE: ${resp}");
                return resp;
            });
    }
}

module.exports = BibleService;
