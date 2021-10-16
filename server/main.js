const { promisify } = require('util');
const express = require('express');

const Database = require('./db/Database');
const ArgParser = require('./util/ArgParser');
const Logger = require('./util/Logger');

class Main {
    static async main(argv) {
        Logger.createLogger('debug')
            .bindToGlobalUnhandledRejection()
            .bindToGlobalUnhandledException()
            .bindToGlobalLog()
            .bindToGlobalConsole();

        const args = Main.parseArgs(argv.slice(2));

        LOG.info(`Setting log level to '${args.level}'`);
        LOG.setLogLevel(args.level);

        LOG.info(`Connecting to database '${args.database}'`);
        const db = new Database(args.database);

        LOG.info('Configuring server');
        const server = express();

        LOG.info('Starting server');
        const listen = promisify(server.listen.bind(server));
        await listen(args.port);
        LOG.info(`Startup complete, listening on http://0.0.0.0:${args.port}`);
    }

    static parseArgs(argv) {
        const argParser = new ArgParser();
        argParser.addHelp('pam', 'Plex Account Manager');
        argParser.addSingleArg('p', 'port', 'Port number', arg => {
            const port = arg - 0;
            if (isNaN(port) || port < 0 || port % 1 !== 0) {
                throw new Error('Invalid port number');
            }
        }, 4200);
        argParser.addSingleArg('l', 'level', 'Log level', arg => {
            if (!LOG.getLogLevels().includes(arg)) {
                throw new Error('Invalid log level');
            }
        }, 'info');
        argParser.addSingleArg('d', 'database', 'Database file', ()=>{}, 'pam.db');
        return argParser.evaluate(argv);
    }
}

Main.main(process.argv);
