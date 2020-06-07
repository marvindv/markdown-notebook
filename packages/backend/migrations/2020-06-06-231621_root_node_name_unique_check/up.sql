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
                      and node_name = new.node_name)
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
                   )
                       not null
                   ) then raise(abort, "root node with same name already exists") end;
end;
