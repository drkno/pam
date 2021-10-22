create table if not exists user (
    id integer primary key,
    display_name text not null,
    plex_id text not null,
    plex_token text not null,
    access_mask integer not null default 0
);
