const request = require('request');
const credentialStore = require('../credentials');
const buildRancherRequestOptions = require('./base-request');

function getServiceByName(name) {
    const rancherClient = require('../rancher-client');
    return rancherClient.getAgentByName(name);
}

function scaleDownService(config, service) {
    return new Promise((resolve, reject) => {
        const stack = "go-agents";
        const cowbellCredentials = credentialStore.get('cowbell');

        const requestOptions = {
            url: `http://${config.cowbell.host}/${cowbellCredentials.token}/scale/${stack}/${service}/down`,
            method: 'POST'
        };

        request(requestOptions, (err, resp) => {
            if(err) {
                return reject(`Error Performing request: ${err}`);
            }

            if(!resp.statusCode.toString().match(/2[0-9]{2}/)) {
                return reject(`Error returned status code: ${resp.statusCode}\n${JSON.stringify(JSON.parse(resp.body), null, 4)}`);
            }

            console.log(resp.body);

            resolve();
        });
    });
}

function deleteAgent(config, id) {
    return new Promise((resolve, reject) => {
        const requestOptions = buildRancherRequestOptions(config, `/projects/${config.environmentId}/services/${id}`, 'DELETE');

        request(requestOptions, (err, resp) => {
            if(err) {
                return reject(`Error Performing request: ${err}`);
            }

            if(!resp.statusCode.toString().match(/2[0-9]{2}/)) {
                return reject(`Error returned status code: ${resp.statusCode}\n${JSON.stringify(JSON.parse(resp.body), null, 4)}`);
            }

            resolve();
        });
    });
}

module.exports = config => {
    return {
        deleteGoAgent: name => {
            return getServiceByName(name)
                .then(existingService => {
                    if(!existingService) {
                        return new Promise((resolve, reject) => reject('Go agent with that name does not exist.'));
                    }

                    if(existingService.scale === 1) {
                        return deleteAgent(config, existingService.id);
                    }

                    return scaleDownService(config, name);
                });
        }
    };
};
