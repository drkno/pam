const User = require('../model/User');

class UsersService {
    constructor(Database) {
        this._db = Database;
    }

    createUser(displayName, plexId, plexToken, ...accessFlags) {
        const accessMask = this._calculateMask(accessFlags);
        const query = this._db.prepare('insert into user (display_name, plex_id, plex_token, access_mask) values (?, ?, ?, ?) returning id');
        const result = query.run(displayName, plexId, plexToken, accessMask);

        return new User({
            id: result.lastInsertRowid,
            display_name: displayName,
            plex_id: plexId,
            plex_token: plexToken,
            access_mask: accessMask
        });
    }

    getUser(plexId) {
        const query = this._db.prepare('select * from user where plex_id = ?');
        return new User(query.plunk().get(plexId));
    }

    searchUsers(displayName) {
        const query = this._db.prepare('select * from user where display_name ilike ? order by display_name');
        return query.all('%' + displayName + '%')
            .map(row => new User(row));
    }

    grantFlags(user, ...accessFlags) {
        const id = this._getUserId(user);
        const query = this._db.prepare('update user set access_mask = access_mark | ? where id = ?');
        query.run(this._calculateMask(accessFlags), id);
    }

    revokeFlags(user, ...accessFlags) {
        const id = this._getUserId(user);
        const query = this._db.prepare('update user set access_mask = access_mark ^ ? where id = ?');
        query.run(this._calculateMask(accessFlags), id);
    }

    updateToken(user, newToken) {
        const id = this._getUserId(user);
        const query = this._db.prepare('update user set plex_token = ? where id = ?');
        query.run(newToken, id);
    }

    _getUserId(user) {
        return typeof(user) === 'number'
            ? user
            : user.getId();
    }

    _calculateMask(flags) {
        return flags.map(flag => typeof(flag) === 'number'
                ? flag
                : flag.getMask())
            .reduce((curr, next) => curr | next, 0);
    }
}

module.exports = UsersService;
