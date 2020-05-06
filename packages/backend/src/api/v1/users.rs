use rocket::{self, get, post, State};
use rocket_contrib::json::Json;
use serde::{Deserialize, Serialize};

use crate::errors::{BackendError, BackendResult};
use crate::jwt;
use crate::models::User;
use crate::{user_management, DbConnectionPool};

#[derive(Deserialize)]
pub struct Credentials {
    username: String,
    password: String,
}

#[derive(Serialize)]
pub struct AuthResponse {
    token: String,
}

/// Handles the login process of a user.
#[post("/user/auth", data = "<credentials>")]
pub fn auth(
    jwt_cfg: State<jwt::Config>,
    credentials: Json<Credentials>,
    pool: State<DbConnectionPool>,
) -> BackendResult<Json<AuthResponse>> {
    let conn = pool.get()?;
    match user_management::check_user(
        &conn,
        &credentials.username,
        &credentials.password,
    )? {
        Some(user) => {
            let token =
                jwt::Claims::from_user(user, &jwt_cfg).into_token(&jwt_cfg)?;
            Ok(Json(AuthResponse { token }))
        }
        None => Err(BackendError::InvalidCredentials),
    }
}

/// Responds the user data of a user to that user.
#[get("/user/profile")]
pub fn profile(
    claims: jwt::Claims,
    pool: State<DbConnectionPool>,
) -> BackendResult<Json<User>> {
    let conn = pool.get()?;
    let user = User::load_by_id(&conn, claims.id())?;
    Ok(Json(user))
}
