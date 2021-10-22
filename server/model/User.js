class User {
    constructor(row) {
        this.id = row.id;
        this.displayName = row.display_name;
        this.plexId = row.plex_id;
        this.plexToken = row.plex_token;
        this.accessMask = row.access_mask;
    }

    getId() {
        return this.id;
    }

    getDisplayName() {
        return this.displayName;
    }

    getPlexid() {
        return this.plexId;
    }

    getPlexToken() {
        return this.plexToken;
    }

    hasAccessFlag(flag) {
        return flag.hasFlag(this.accessMask);
    }

    toString() {
        return this.getId();
    }
}

module.exports = User;
