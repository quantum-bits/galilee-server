'use strict';

const Request = require('superagent');

const nconf = require('../master-config');

// Terminate the server with extreme prejudice.
function terminateServer(messageLines = []) {
    console.error(chalk.red('='.repeat(8), 'ERROR - TERMINATING PROCESS', '='.repeat(23)));
    messageLines.forEach(line => console.error(chalk.red(line)));
    console.error(chalk.red('='.repeat(60)));
    process.exit(1);
}

// Send a message to a Slack channel.
function notify(message, emoji) {
    Request
        .post(nconf.get('slack:hook-url'))
        .send({icon_emoji: `:${emoji}:`, text: message})
        .catch(err => console.error(err));
}

exports.notifyWarning = function(message) {
    notify(message, "warning");
};

exports.notifyInfo = function(message) {
    notify(message, "information_source")
}
