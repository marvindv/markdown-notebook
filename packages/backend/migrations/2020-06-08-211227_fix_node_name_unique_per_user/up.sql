-- In the previous version of the nodes table and the triggers
-- CheckInsertUniqueRootName and CheckUpdateUniqueRootName the node name
-- uniqueness was enforces globally and not per user.

pragma foreign_keys = off;

create table new_nodes
(
    node_id             integer primary key           not null,
    node_name           varchar(255)                  not null,
    parent_id           integer,
    parent_is_directory boolean,
    owner_id            integer references users (id) not null,
    is_directory        boolean                       not null,
    content             text,

    unique (node_name, parent_id, owner_id),
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

insert into new_nodes select * from nodes;
drop table nodes;
alter table new_nodes rename to nodes;

-- This triggers ensure that root node (parent_id is null) names are unique,
-- one to check before insert and one before update.

create trigger CheckInsertUniqueRootName
    before insert
    on nodes
    when new.parent_id is null
begin
    select case
               when (
                   (select 1
                    from nodes
                    where parent_id is null
                      -- In case a node_id is specified on insert.
                      and node_id <> new.node_id
                      and node_name = new.node_name
                      and owner_id = new.owner_id)
                       not null
                   ) then raise(abort, "root node with same name already exists") end;
end;

create trigger CheckUpdateUniqueRootName
    before update
    on nodes
    when new.parent_id is null
begin
    select case
               when (
                   (select 1
                    from nodes
                    -- Make sure to not select the node that is currently updated.
                    -- But this also means updating the node_id will fail, which will probably not
                    -- be done.
                    where nodes.node_id is not new.node_id
                      and nodes.parent_id is null
                      and nodes.node_name = new.node_name
                      and nodes.owner_id = new.owner_id
                   )
                       not null
                   ) then raise(abort, "root node with same name already exists") end;
end;

pragma foreign_key_check;
pragma foreign_keys = on;
