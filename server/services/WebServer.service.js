const { promisify } = require('util');
const express = require('express');
const { swaggerJson } = require('express-sitemap-html');
const swaggerUi = require('swagger-ui-express');

const DEFAULT_PORT = 4200;
const SWAGGER_PATH = '/api/swagger';
const SWAGGER_NAME = 'PAM';

class WebServer {
    constructor(ArgParser) {
        this.argParser = ArgParser;
        this.argParser.addSingleArg('p', 'port', 'Port number', arg => {
            const port = arg - 0;
            if (isNaN(port) || port < 0 || port % 1 !== 0) {
                throw new Error('Invalid port number');
            }
        }, DEFAULT_PORT);

        this.server = express();
        this.server.use(express.json());
        this.instance = null;
    }

    async afterStart() {
        this.configureSwagger();
        const port = this.argParser.getArgument('port');
        LOG.info('Starting server');
        const listen = promisify(this.server.listen.bind(this.server));
        this.instance = await listen(port);
        LOG.info(`Listening on http://localhost:${port}`);
    }

    configureSwagger() {
        const json = swaggerJson(SWAGGER_NAME, this.server);
        this.server.use(SWAGGER_PATH, swaggerUi.serve);
        this.server.get(SWAGGER_PATH, swaggerUi.setup(json));
    }

    beforeStop() {
        if (this.instance !== null) {
            this.instance.close();
        }
    }

    get() {
        return this.server;
    }
}

module.exports = WebServer;
