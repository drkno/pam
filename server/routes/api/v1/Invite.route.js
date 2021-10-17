const ApiRoute = require('../ApiRouter');

class InviteRoute extends ApiRoute {
    constructor(WebServer) {
        super(WebServer, 'v1');
    }

    get(req, res) {
        res.json({
            test: 'hello world'
        });
    }
}

module.exports = InviteRoute;
