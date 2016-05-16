const request = require('request');
const buildRancherRequestOptions = require('./base-request');

module.exports = config => {
    const buildRequest = buildRancherRequestOptions.bind(undefined, config);

    return {
        getAgentByName: name => new Promise(resolve => {
            const requestOptions = buildRequest(`/projects/${config.environmentId}/services/?environmentId=${config.goStackId}&kind=service&name=${name}`, 'GET');

            request(requestOptions, (err, resp) => {
                const response = JSON.parse(resp.body);

                if(!response.data.length) {
                    return resolve();
                }

                resolve(Object.keys(response.data[0])
                    .reduce((all, currentKey) => {
                        if(['id', 'name', 'state', 'scale'].includes(currentKey)) {
                            all[currentKey] = response.data[0][currentKey];
                        }

                        return all;
                    }, {}));
            });
        }),
        listActiveAgents: () => new Promise(resolve => {
            const requestOptions = buildRequest(`/projects/${config.environmentId}/services/?environmentId=${config.goStackId}&kind=service`, 'GET');

            request(requestOptions, (err, resp) => {
                const response = JSON.parse(resp.body);

                resolve(response.data
                    .map(item => Object.keys(item)
                        .reduce((all, currentKey) => {
                            if(['id', 'name', 'state', 'scale'].includes(currentKey)) {
                                all[currentKey] = item[currentKey];
                            }

                            return all;
                        }, {})));
            });
        })
    };
};
