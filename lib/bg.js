'use strict';

const Request = require('superagent');
const debug = require('debug')('bg');
const moment = require('moment');
const chalk = require('chalk');

const DevOps = require('./devOps');
const Config = require('../models/Config');
const Version = require('../models/Version');

const BG_API_BASE_URL = 'https://api.biblegateway.com/3';

class AuthenticationService {
    constructor() {
        this.valid = false;
        this.userId = null;
        this.accessToken = null;
        this.receivedAt = null;
        this.expiresAt = null
    }

    init(username, password) {
        debug("Request authentication from BG");
        return new Promise((resolve, reject) => {
            Request
                .post(`${BG_API_BASE_URL}/user/authenticate`)
                .type('form')
                .send({
                    username: username,
                    password: password
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

class BibleService {
    constructor() {
        // BG authentication service.
        this.authService = null;

        // Galilee Version objects for versions currently available from BG.
        this.authorizedVersions = [];    // All available versions
        this.defaultVersion = null;     // Default version
    }

    init(authService) {
        debug("Init Bible service")
        this.authService = authService;

        return new Promise((resolve, reject) => {
            this._fetchAuthorizedBgVersions()
                .then(bgVersions => this._loadAllVersions(bgVersions))
                .then(bgVersions => this.getDefaultVersion(bgVersions))
                .then(() => {
                    debug("Init complete %O", this);
                    return resolve(this);
                });
        });
    }

    findVersionByCode(versionCode) {
        return this.authorizedVersions.find(v => v.code == versionCode);
    }

    findVersionById(versionId) {
        return this.authorizedVersions.find(v => v.id == versionId);
    }

    // Retrieve detailed version information from BG.
    getVersionInfo(version) {
        debug("Get version info from BG for %o", version);
        return Request.get(`${BG_API_BASE_URL}/bible/${version}`)
            .query({access_token: this.authService.getAccessToken()})
            .then(resp => resp.body.data[0]);
    }

    // Fetch versions for which we're authorized on BG.
    _fetchAuthorizedBgVersions() {
        debug("Fetch BG versions");
        return Request
            .get(`${BG_API_BASE_URL}/bible`)
            .query({access_token: this.authService.getAccessToken()})
            .accept('json')
            .then(bgVersions => {
                const versionData = bgVersions.body.data;
                debug("Authorized BG versions %O", versionData);
                return versionData.map(elt => ({
                    translation: elt.translation,
                    last_modified: moment(elt.last_modified)
                }))
            });
    }

    // Load or create a Galilee Version object for the given version.
    _loadOneVersion(versionCode) {
        debug("Load version %o", versionCode);
        return Version.query()
            .where('code', versionCode)
            .first()
            .then(version => {
                if (version) {
                    debug("%o already in DB", versionCode);
                    return version;
                } else {
                    // Go to BG to fetch details (particularly the translation title).
                    return this.getVersionInfo(versionCode)
                        .then(versionInfo => {
                            debug("Adding %o to DB", versionCode)
                            return Version.query().insert({
                                code: versionCode,
                                title: versionInfo.attribution.translation_name
                            })
                        });
                }
            });
    }

    // Load or create all Galilee Version objects for the BG versions.
    _loadAllVersions(bgVersions) {
        debug("Get Galilee versions for BG versions %O", bgVersions);
        return Promise
            .all(bgVersions.map(v => this._loadOneVersion(v.translation)))
            .then(allVersions => {
                debug("All versions %O", allVersions);
                this.authorizedVersions = allVersions;
                return bgVersions;
            });
    }

    // Figure out an authorized default version.
    getDefaultVersion(bgVersions) {
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
                const licensedVersions = this.authorizedVersions.map(v => v.code).join(', ');
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

    // Promise that resolves to Galilee Version objects for all currently authorized BG translations.
    getAuthorizedVersions() {
        return this.authorizedVersions;
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

module.exports = {
    AuthenticationService: AuthenticationService,
    BibleService: BibleService
}
