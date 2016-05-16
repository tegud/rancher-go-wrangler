const credentialStore = require('../credentials');

module.exports = function buildRancherRequestOptions(config, path, method, body) {
    const credentials = credentialStore.get('rancher');
    const auth = new Buffer(`${credentials.accessKey}:${credentials.secret}`).toString('base64');
    return {
        url: `https://${config.host}/v1${path}`,
        method: method,
        headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    };
};
