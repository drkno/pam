const Orm = require('../db/Orm');
const ProxyClass = require('../util/ProxyClass');
const { join } = require('path');

const ENV_CONFIG_LOCATION = 'CONFIG_DIRECTORY';
const DEFAULT_DB_FILE = 'pam.db';

class Database extends ProxyClass {
    constructor(ArgParser) {
        super(target => target.db);
        this.argParser = ArgParser;
        const workingDir = process.env[ENV_CONFIG_LOCATION] || process.cwd()
        const defaultDbLocation = join(workingDir, DEFAULT_DB_FILE);
        this.argParser.addSingleArg('d', 'database', 'Database file', ()=>{}, defaultDbLocation);
        this.db = null;
    }

    afterStart() {
        const dbFile = this.argParser.getArgument('database');
        LOG.info(`Connecting to database '${dbFile}'`);
        this.db = new Orm(dbFile);
    }

    beforeStop() {
        if (this.db) {
            this.db.close();
        }
    }
}

module.exports = Database;
