const Orm = require('../db/Orm');
const ProxyClass = require('../util/ProxyClass');

const DEFAULT_DB_FILE = 'pam.db';

class Database extends ProxyClass {
    constructor(ArgParser) {
        super(target => target.db);
        this.argParser = ArgParser;
        this.argParser.addSingleArg('d', 'database', 'Database file', ()=>{}, DEFAULT_DB_FILE);
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
