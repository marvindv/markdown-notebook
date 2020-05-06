use diesel::prelude::*;
use serde::Serialize;

use super::schema::users;
use crate::{BackendResult, DbConnection};

pub type UserId = i32;

#[derive(Insertable)]
#[table_name = "users"]
pub struct NewUser<'a> {
    pub username: &'a str,
    pub password_hash: &'a str,
}

#[derive(Queryable, Serialize)]
pub struct User {
    pub id: UserId,
    pub username: String,
    #[serde(skip)]
    pub password_hash: String,
}

impl User {
    // Loads a user by the associated user id. Returns `BackendError::NotFound`
    // if the user does not exist.
    pub fn load_by_id(conn: &DbConnection, id: UserId) -> BackendResult<User> {
        // diesel::result::Error::NotFound will be converted into
        // BackendError::NotFound through the From trait implementation
        // on BackendError.
        let user = users::table.filter(users::id.eq(id)).first::<User>(conn)?;
        Ok(user)
    }

    // Loads a user by the associated username. Returns `BackendError::NotFound`
    // if the user does not exist.
    pub fn load_by_username(
        conn: &DbConnection,
        username: &str,
    ) -> BackendResult<User> {
        // diesel::result::Error::NotFound will be converted into
        // BackendError::NotFound through the From trait implementation
        // on BackendError.
        let user = users::table
            .filter(users::username.eq(username))
            .first::<User>(conn)?;
        Ok(user)
    }
}
