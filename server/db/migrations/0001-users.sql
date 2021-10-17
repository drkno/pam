create table if not exists user (
    id integer primary key,
    plex_token text not null,
    access_mask integer not null default 0
);
