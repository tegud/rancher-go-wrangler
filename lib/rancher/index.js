const request = require('request');
const buildRancherRequestOptions = require('./base-request');

module.exports = function(config) {
    const buildRequest = buildRancherRequestOptions.bind(undefined, config);

    return ['get-agents', 'create-agent', 'delete-agent']
        .map(handler => require(`./${handler}`)(config))
        .reduce((api, handlerSet) => {
            Object.keys(handlerSet).map(handler => {
                api[handler] = handlerSet[handler];
            });

            return api;
        }, {});
};
