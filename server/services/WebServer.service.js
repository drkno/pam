const { promisify } = require('util');
const express = require('express');

const DEFAULT_PORT = 4200;

class WebServer {
    constructor(ArgParser, Database, Logger) {
        this.argParser = ArgParser;
        this.argParser.addSingleArg('p', 'port', 'Port number', arg => {
            const port = arg - 0;
            if (isNaN(port) || port < 0 || port % 1 !== 0) {
                throw new Error('Invalid port number');
            }
        }, DEFAULT_PORT);

        this.server = express();
        this.instance = null;
    }

    async afterStart() {
        const port = this.argParser.getArgument('port');
        LOG.info('Starting server');
        const listen = promisify(this.server.listen.bind(this.server));
        this.instance = await listen(port);
        LOG.info(`Listening on http://localhost:${port}`);
    }

    beforeStop() {
        if (this.instance !== null) {
            this.instance.close();
        }
    }
}

module.exports = WebServer;
