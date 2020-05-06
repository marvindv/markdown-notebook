table! {
    notebooks (notebook_id) {
        notebook_id -> Integer,
        notebook_title -> Text,
        user_id -> Integer,
    }
}

table! {
    pages (page_id) {
        page_id -> Integer,
        page_title -> Text,
        content -> Text,
        section_id -> Integer,
    }
}

table! {
    sections (section_id) {
        section_id -> Integer,
        section_title -> Text,
        notebook_id -> Integer,
    }
}

table! {
    users (id) {
        id -> Integer,
        username -> Text,
        password_hash -> Text,
    }
}

joinable!(notebooks -> users (user_id));
joinable!(pages -> sections (section_id));
joinable!(sections -> notebooks (notebook_id));

allow_tables_to_appear_in_same_query!(
    notebooks,
    pages,
    sections,
    users,
);
