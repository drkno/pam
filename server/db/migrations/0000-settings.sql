create table if not exists settings (
    id integer primary key,
    key text not null,
    value text
);
