mod nodes;
mod users;

use rocket::{routes, Route};

pub fn get_routes() -> Vec<Route> {
    routes![
        users::auth,
        users::profile,
        nodes::change_content,
        nodes::change_name,
        nodes::create_node,
        nodes::delete,
        nodes::get_nodes
    ]
}
