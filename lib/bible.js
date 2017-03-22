'use strict';

const Request = require('superagent');
const debug = require('debug')('bg');
const moment = require('moment');

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
            this.authorizedVersions.concat(bgService.authorizedTranslations);
        }).then(() => {
            return new CrosswayService(masterConfig).then(crosswayService => {
                this.crosswayService = crosswayService;
                this.authorizedVersions.concat(crosswayService.authorizedTranslations);
            })
        }).then(() => {
            return this._cacheAuthorizedVersions();
        })
    }

    // Load or create a Galilee Version object for the given translation.
    _cacheAuthorizedVersion(translation) {
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

    // Load or create all Galilee Version objects for the BG versions.
    _cacheAuthorizedVersions(translations) {
        debug("Get Galilee versions for BG translations %O", bgVersions);
        return Promise
            .all(translations.map(translation => this._cacheOneVersion(translation)))
            .then(allVersions => {
                debug("All versions %O", allVersions);
                return allVersions;
            });
    }

    findVersionByCode(versionCode) {
        return this.authorizedVersions.find(v => v.code == versionCode);
    }

    findVersionById(versionId) {
        return this.authorizedVersions.find(v => v.id == versionId);
    }

    getPassage(versionCode, osisRef) {
        return this.bibleGatewayService.getPassage(versionCode, osisRef);
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
    _fetchVersionInfo(version) {
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
                    return this._fetchVersionInfo(xlation.translation).then(xlationDetail => {
                        return {
                            code: xlation.translation,
                            title: xlationDetail.attribution.translation_name,
                            date: moment(xlation.last_modifed),
                        }
                    });
                });
            });
    }

    // Figure out an authorized default version.
    _getDefaultVersion(bgVersions) {
        return Config.getDefaultVersion().then(config => {
            const defaultVersionCode = config.value;
            debug("Default version from config %o", defaultVersionCode);

            this.defaultVersion = this.findVersionByCode(defaultVersionCode);
            if (this.defaultVersion) {
                debug("Default version %o is licensed", this.defaultVersion);
                return true;
            } else {
                // Deault version is not licensed.

                // From the authorized BG versions, pick the newest.
                const newestBgVersion = bgVersions.reduce((a, b) => {
                    return a.last_modified.isAfter(b.last_modified) ? a : b;
                });
                const temporaryDefault = this.findVersionByCode(newestBgVersion.translation);

                // Construct error message.
                const licensedVersions = this.authorizedTranslations.map(v => v.code).join(', ');
                const message = [
                    `Licensed for these versions: ${licensedVersions}.`,
                    `Default version (${defaultVersionCode}) isn't licensed;`,
                    `using ${temporaryDefault.code} instead.`,
                    'Update default version in database.'].join(' ');
                this.defaultVersion = temporaryDefault;

                // Send warning to sys admins.
                DevOps.notifyWarning(message);
                return false;
            }
        });
    }

    // Retrieve a passage in a given version from BG. If the version is not currently
    // authorized, raise an error.
    getPassage(versionCode, osis) {
        debug("Get %o from %o", osis, versionCode);
        if (!this.findVersionByCode(versionCode)) {
            throw new Error(`Not authorized for version ${versionCode}`);
        }
        return Request.get(`${BG_API_BASE_URL}/bible/${osis}/${versionCode}`)
            .query({access_token: this.authService.getAccessToken()})
            .then(resp => resp.body.data[0]);
    }
}

class CrosswayService {
    constructor(masterConfig) {
        this.authorizedTranslations = [];

        debug("Initialize Crossway service")
        return new Promise.resolve(this);
    }
}

module.exports = BibleService;
