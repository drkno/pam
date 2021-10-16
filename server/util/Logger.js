const winston = require('winston');
const { createLogger, format, transports } = require('winston');

class Logger {
    constructor() {
        this.setupComplete = false;
    }

    static createLogger(logLevel) {
        const logger = createLogger({
            level: logLevel,
            format: format.combine(
                format.timestamp({
                    format: 'YYYY-MM-DD HH:mm:ss'
                }),
                format.splat(),
                format.colorize({ all: false }),
                format.printf(info => {
                    if (info.stack) {
                        info.message = info.stack;
                    } else if (typeof(info.message) !== 'string') {
                        try {
                            info.message = JSON.stringify(info.message, null, 4);
                        } catch(e) {}
                    }
                    return `[${info.timestamp}] [${info.level}] ${info.message}`;
                }),
            ),
            transports: [
                new transports.Console()
            ]
        });

        logger.getLogLevels = () => {
            return Object.keys(logger.levels);
        };

        logger.bindToGlobalLog = () => {
            global.LOG = logger;
            return logger;
        };

        logger.bindToGlobalUnhandledRejection = () => {
            process.on('unhandledRejection', reason => {
                LOG.error(reason.stack);
            });
            return logger;
        };

        logger.bindToGlobalUnhandledException = () => {
            process.on('uncaughtException', reason => {
                LOG.error(reason.stack);
            });
            return logger;
        };
    
        logger.bindToGlobalConsole = () => {
            const replaceConsole = level => {
                console[level] = logger[level].bind(logger);
            };
            for (let level of logger.getLogLevels()) {
                if (console[level]) {
                    replaceConsole(level);
                }
            }
            console.log = logger.info.bind(logger);
            return logger;
        };

        logger.setLogLevel = level => {
            if (!logger.getLogLevels().includes(level)) {
                throw new Error('Invalid log level');
            }
            logger.level = level;
            return logger;
        };

        return logger;
    }
}

module.exports = Logger;
