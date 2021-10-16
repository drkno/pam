create table if not exists plex_invite (
    id integer primary key,
    token text not null,
    expiry integer not null,
    used integer not null default 0
);
