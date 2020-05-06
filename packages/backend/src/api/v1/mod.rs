mod notebooks;
mod users;

use rocket::{routes, Route};

pub fn get_routes() -> Vec<Route> {
    routes![
        notebooks::create_notebook,
        notebooks::modify_notebook,
        notebooks::delete_notebook,
        notebooks::create_section,
        notebooks::modify_section,
        notebooks::delete_section,
        notebooks::create_page,
        notebooks::modify_page,
        notebooks::delete_page,
        notebooks::fetch_notebooks,
        users::auth,
        users::profile
    ]
}
