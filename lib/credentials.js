const credentials = require('../credentials.json');

module.exports = {
    get: credentialsSet => credentials[credentialsSet]
};
