const Sqlite = require('better-sqlite3');
const { readFileSync, readdirSync } = require('fs');
const { join, basename } = require('path');

class Orm extends Sqlite {
    constructor(file) {
        super(file, {
            verbose: LOG.debug.bind(LOG)
        });
        this._migrate();
    }

    _migrate() {
        this.exec(`
            create table if not exists schema_migrations (
                id integer primary key,
                migration text not null,
                runat integer not null
            );
        `);

        const completedMigrations = this.prepare('select migration from schema_migrations')
            .all()
            .map(row => row.migration)
            .reduce((curr, next) => {
                curr[next] = true;
                return curr;
            }, {})
        
        const migrationsPath = join(__dirname, 'migrations');
        const migrations = readdirSync(migrationsPath)
            .filter(file => file.endsWith('.sql'))
            .map(file => join(migrationsPath, file))
            .sort()
            .filter(file => !completedMigrations[basename(file)]);

        LOG.debug('Running migrations');
        for (let migration of migrations) {
            LOG.debug(`Migration ${migration}`);
            const sqlMigration = readFileSync(migration, 'utf-8');
            this.exec(sqlMigration);
            this.prepare(`insert into schema_migrations (migration, runat) values (@migration, @runat)`)
                .run({
                    migration: basename(migration),
                    runat: new Date().getTime()
                });
        }
    }
}

module.exports = Orm;
