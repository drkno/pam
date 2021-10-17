const Logger = require('../util/Logger');

const START_STOP_LEVEL = 'debug';
const DEFAULT_LOG_LEVEL = 'info';

Logger.createLogger(START_STOP_LEVEL)
    .bindToGlobalUnhandledRejection()
    .bindToGlobalUnhandledException()
    .bindToGlobalLog()
    .bindToGlobalConsole();

class GlobalLogger {
    constructor(ArgParser) {
        this.argParser = ArgParser;
        this.argParser.addSingleArg('l', 'level', 'Log level', arg => {
            if (!LOG.getLogLevels().includes(arg)) {
                throw new Error('Invalid log level');
            }
        }, DEFAULT_LOG_LEVEL);
    }

    afterStart() {
        const level = this.argParser.getArgument('level');
        LOG.info(`Setting log level to '${level}'`);
        LOG.setLogLevel(level);
    }

    beforeStop() {
        LOG.info(`Re-setting log level to '${START_STOP_LEVEL}' for shutdown`);
        LOG.setLogLevel(START_STOP_LEVEL);
    }
}

module.exports = GlobalLogger;
