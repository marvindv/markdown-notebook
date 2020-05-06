use crate::models::{NewUser, User, UserId};
use crate::{BackendError, BackendResult, DbConnection};
use bcrypt::{hash, verify, DEFAULT_COST};
use diesel::prelude::*;

/// Creates a new user with the given username and password.
pub fn create<'a>(
    conn: &DbConnection,
    username: &'a str,
    password: &'a str,
) -> BackendResult<User> {
    use crate::models::schema::users;

    let password_hash = hash(password, DEFAULT_COST)?;
    let new_user = NewUser {
        username,
        password_hash: &password_hash,
    };

    conn.transaction(|| {
        diesel::insert_into(users::table)
            .values(&new_user)
            .execute(conn)?;

        let user = User::load_by_username(conn, username)?;
        Ok(user)
    })
}

/// Deletes the user associated to the given user id. Returns
/// `BackendError::NotFound` if there is no user with the given user id.
pub fn delete<'a>(conn: &DbConnection, user_id: UserId) -> BackendResult<()> {
    use crate::models::schema::users;
    let count = diesel::delete(users::table.filter(users::id.eq(user_id)))
        .execute(conn)?;
    if count < 1 {
        Err(BackendError::NotFound)
    } else {
        Ok(())
    }
}

// Changes the password of the user associated to the given id.
pub fn change_password<'a>(
    conn: &DbConnection,
    user_id: UserId,
    new_password: &'a str,
) -> BackendResult<User> {
    use crate::models::schema::users;

    let password_hash = hash(new_password, DEFAULT_COST)?;
    conn.transaction(|| {
        let count = diesel::update(users::table.find(user_id))
            .set(users::password_hash.eq(password_hash))
            .execute(conn)?;
        if count < 1 {
            return Err(BackendError::NotFound);
        }

        let user = User::load_by_id(conn, user_id)?;
        Ok(user)
    })
}

/// Checks whether there exists a user with the given username and password
/// combination.
///
/// Returns `Ok(None)` if the user does not exist or the password is wrong.
/// Returns `Err(...)` if an error occured during check that is not caused by
/// the credentials being wrong.
/// Returns `Ok(User {...})` if the username password combination is correct.
pub fn check_user(
    conn: &DbConnection,
    username: &str,
    password: &str,
) -> BackendResult<Option<User>> {
    let user = match User::load_by_username(conn, username) {
        Ok(user) => user,
        Err(err) => match &err {
            BackendError::NotFound => return Ok(None),
            _ => return Err(err),
        },
    };
    if verify(password, &user.password_hash)? {
        Ok(Some(user))
    } else {
        Ok(None)
    }
}
