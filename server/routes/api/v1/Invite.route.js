const { v4 } = require('uuid');
const ApiRoute = require('../ApiRouter');

// default expiry = 1w
const DEFAULT_EXPIRY_MS = 604800000;

class InviteRoute extends ApiRoute {
    constructor(WebServer, Database) {
        super(WebServer, 'v1');
        this._db = Database;
    }

    get(req, res) {
        res.json({
            test: 'hello world'
        });
    }

    put_create(req, res) {
        try {
            
            // todo validate access level

            const plexServerId = this._validateServerId(req.body.plexServerId);
            const inviteExpiry = this._generateExpiry(req.body.inviteExpiry);
            const inviteToken = this._generateToken(req.body.inviteToken);

            const query = this._db.prepare(`
                insert into plex_invite
                (server_id, token, expiry)
                values
                (?, ?, ?)
                returning id
            `);
            const result = query.run(plexServerId, inviteToken, inviteExpiry);
            
            res.json({
                success: true,
                invite: {
                    inviteId: result.lastInsertRowid,
                    plexServerId,
                    inviteToken,
                    inviteExpiry
                }
            });
        }
        catch(e) {
            res.status(400).json({
                success: false
            });
            LOG.error(e);
        }
    }

    _generateExpiry(providedExpiry) {
        const currTime = new Date();

        providedExpiry = providedExpiry
            ? new Date(providedExpiry)
            : new Date(currTime.getTime() + DEFAULT_EXPIRY_MS);
        
        if (providedExpiry.getTime() < currTime.getTime()) {
            throw new Error('Expiry is in the past');
        }

        return providedExpiry.getTime();
    }

    _generateToken(providedToken) {
        if (providedToken) {
            const query = this._db.prepare(`
                select count(*) as count
                from plex_invite
                where token = ?
            `);
            const row = query.get(providedToken);
            if (row.count > 0) {
                throw new Error('Token already in use');
            }
            return providedToken;
        } else {
            return v4();
        }
    }

    _validateServerId(serverId) {
        if (!serverId) {
            throw new Error('Server ID must be provided');
        }

        // todo check valid server ids

        return serverId;
    }
}

module.exports = InviteRoute;
