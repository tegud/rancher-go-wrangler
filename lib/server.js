const express = require('express');
const moment = require('moment');
const webserver = express();

webserver
    .get('/', (req, res) => {
        res.status(200).send(JSON.stringify({
            "name": "Rancher GO Wrangler",
            "serverTime": moment().format(),
            "operations": {
                "/images": { "methods": ["GET"], "description": "Lists all known agent Docker images" },
                "/agents": { "methods": ["GET"], "description": "Lists all known agents" },
                "/agent": { "methods": ["POST", "DELETE"], "description": "Create or Remove an agent" }
            }
        }));
    })
    .get('/images', (req, res) => {
        res.status(200)
            .send(JSON.stringify({
                images: require('../agent_images.json')
            }));
    })
    .get('/agents', (req, res) => {
        res.status(200)
            .send(JSON.stringify({
                agents: []
            }));
    })
    .post('/agent', (req, res) => {
        res.status(200)
            .send(JSON.stringify({
                message: 'No action performed'
            }));
    })
    .delete('/agent', (req, res) => {
        res.status(200)
            .send(JSON.stringify({
                message: 'No action performed'
            }));
    });

module.exports = function (config) {
    let httpServer;

    return {
        start: () => new Promise((resolve, reject) => {
            httpServer = webserver.listen(config.port, (err) => {
                if(err) {
                    reject(err);
                }

                resolve();
            });
        }),
        stop: () => new Promise(resolve => resolve(httpServer.close()))
    };
};
