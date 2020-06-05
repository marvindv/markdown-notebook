table! {
    nodes (node_id) {
        node_id -> Integer,
        node_name -> Text,
        parent_id -> Nullable<Integer>,
        parent_is_directory -> Nullable<Bool>,
        owner_id -> Integer,
        is_directory -> Bool,
        content -> Nullable<Text>,
    }
}

table! {
    users (id) {
        id -> Integer,
        username -> Text,
        password_hash -> Text,
    }
}

allow_tables_to_appear_in_same_query!(
    nodes,
    users,
);
