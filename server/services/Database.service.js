const Orm = require('../db/Orm');

const DEFAULT_DB_FILE = 'pam.db';

class Database {
    constructor(ArgParser) {
        this.argParser = ArgParser;
        this.argParser.addSingleArg('d', 'database', 'Database file', ()=>{}, DEFAULT_DB_FILE);
        this.db = null;

        return new Proxy(this, {
            get: (target, property) => {
                if (target[property]) {
                    return target[property];
                }
                return target.db[property];
            }
        });
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
