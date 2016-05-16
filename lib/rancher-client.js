const RancherClient = require('./rancher');

module.exports = new RancherClient({
    host: 'dev-ranchermanager.laterooms.com',
    environmentId: '1a16',
    goStackId: '1e47',
    cowbell: {
        host: "cowbell.cowbell.development01.laterooms.work:8080"
    }
});
