const request = require('request');
const credentialStore = require('../credentials');
const buildRancherRequestOptions = require('./base-request');
const agentImages = require('../agent-images');

function getServiceByName(name) {
    const rancherClient = require('../rancher-client');
    return rancherClient.getAgentByName(name);
}

function createService(config, agentImage) {
    return new Promise((resolve, reject) => {
        const requestOptions = buildRancherRequestOptions(config, `/projects/${config.environmentId}/services`, 'POST', {
            "environmentId": config.goStackId,
            "name": agentImage.name,
            "launchConfig": {
                "kind":"container",
                "networkMode":"managed",
                "startOnCreate":true,
                "stdinOpen":true,
                "tty":true,
                "type":"launchConfig",
                "imageUuid": `docker:${agentImage.image}`
            },
            "scale": 1,
            "assignServiceIpAddress":false,
            "startOnCreate":true
        });

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

function scaleUpService(config, service) {
    return new Promise((resolve, reject) => {
        const stack = "go-agents";
        const cowbellCredentials = credentialStore.get('cowbell');

        const requestOptions = {
            url: `http://${config.cowbell.host}/${cowbellCredentials.token}/scale/${stack}/${service.name}/up`,
            method: 'POST'
        };

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
        createGoAgent: name => {
            return getServiceByName(name)
                .then(existingService => {
                    if(existingService) {
                        return scaleUpService(config, existingService);
                    }

                    const agentImage = agentImages.findByName(name);

                    if(!agentImage) {
                        return new Promise((resolve, reject) => reject(`Could not find image: ${name}`));
                    }

                    return createService(config, agentImage);
                });
        }
    };
};
