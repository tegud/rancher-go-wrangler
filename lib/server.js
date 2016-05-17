const express = require('express');
const moment = require('moment');
const rancherClient = require('./rancher-client');
const agentImages = require('./agent-images');
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
                images: agentImages.all()
            }));
    })
    .get('/agents', (req, res) => {
        rancherClient.listActiveAgents().then(agents => {
            res.status(200)
                .send(JSON.stringify({
                    agents: agents
                }));
        });
    })
    .post('/agent', (req, res) => {
        if(!req.query.agentImage) {
            return res.status(400)
                .send(JSON.stringify({
                    message: 'You must specify an agentImage name'
                }));
        }

        rancherClient
            .createGoAgent(req.query.agentImage)
            .then(() => {
                res.status(200)
                    .send(JSON.stringify({
                        message: 'Go Agent Created'
                    }));
            })
            .catch(e => {
                res.status(500)
                    .send(JSON.stringify({
                        message: e
                    }));
            });

    })
    .delete('/agent', (req, res) => {
        if(!req.query.agentImage) {
            return res.status(400)
                .send(JSON.stringify({
                    message: 'You must specify an agentImage name'
                }));
        }

        rancherClient
            .deleteGoAgent(req.query.agentImage)
            .then(() => {
                res.status(200)
                    .send(JSON.stringify({
                        message: 'Go Agent Deleted'
                    }));
            })
            .catch(e => {
                res.status(500)
                    .send(JSON.stringify({
                        message: e
                    }));
            });
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
