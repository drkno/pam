const ApiRoute = require('../ApiRouter');

class HealthcheckRoute extends ApiRoute {
    constructor(WebServer) {
        super(WebServer, 'v1');
    }

    get(req, res) {
        res.json({
            alive: true
        });
    }
}

module.exports = HealthcheckRoute;
