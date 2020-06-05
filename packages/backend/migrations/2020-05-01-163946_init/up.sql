create table users
(
  id integer primary key not null,
  username varchar(255) not null unique,
  password_hash text not null
);
create index users__username on users (username);

create table nodes
(
    node_id             integer primary key           not null,
    node_name           varchar(255)                  not null,
    parent_id           integer,
    parent_is_directory boolean,
    owner_id            integer references users (id) not null,
    is_directory        boolean                       not null,
    content             text,

    unique (node_name, parent_id),
    -- Required so the following foreign key works.
    unique (node_id, is_directory, owner_id),
    foreign key (parent_id, parent_is_directory, owner_id)
      references nodes (node_id, is_directory, owner_id)
      on delete cascade,
    foreign key (owner_id) references users (id),
    -- A directory must not have the content set. A file must have content set.
    check (
      (is_directory = true and content is null) or
      (is_directory = false and content is not null)
    ),
    -- The parent must be a directory and parent_owner_id must be specified if
    -- a parent_id is not null.
    check (
      (parent_id is null and parent_is_directory is null) or
      (parent_id is not null and parent_is_directory = true)
    )
);
