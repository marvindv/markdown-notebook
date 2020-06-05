use chrono::prelude::*;
use jsonwebtoken::{
    decode, encode, Algorithm, DecodingKey, EncodingKey, Header, Validation,
};
use rocket::http::Status;
use rocket::request::{FromRequest, Outcome};
use rocket::{Request, State};
use serde::{Deserialize, Serialize};

use crate::models::{User, UserId};
use crate::BackendResult;

#[derive(Clone)]
pub struct Config {
    /// The secret to be used to sign JWTs.
    pub secret: String,
    /// The number of seconds a jwt is valid after being issued.
    pub expire_in: i64,
    /// Leeway in seconds for the validation of the claims `exp`, `iat` and
    /// `nbf`. The values of these properties are considered invalid this much
    /// seconds after they are expired.
    pub validation_leeway: u64,
}

/// Represents the data stored in each JWT. Can be used as a request guard to
/// ensure that a jwt is present in the request.
#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    sub: UserId,
    username: String,
    exp: i64,
}

impl Claims {
    /// Returns the id of the user associated to the given jwt.
    pub fn id(&self) -> UserId {
        self.sub
    }

    /// Constructs a Claims instance from a given user.
    pub fn from_user(user: User, cfg: &Config) -> Claims {
        Claims {
            sub: user.id,
            username: user.username,
            exp: Utc::now().timestamp() + cfg.expire_in,
        }
    }

    /// Tries to extract claims from a given token string. Returns an Error
    /// if the token string is not a JWT, does not match our secret or it is
    /// expired.
    pub fn from_token(token: &str, cfg: &Config) -> BackendResult<Claims> {
        let validation = Validation {
            leeway: cfg.validation_leeway,
            algorithms: vec![Algorithm::HS256],
            ..Default::default()
        };

        let result = decode::<Claims>(
            &token,
            &DecodingKey::from_secret(cfg.secret.as_ref()),
            &validation,
        );
        Ok(result?.claims)
    }

    /// Converts the claims into a JWT. Should not fail.
    pub fn to_token(&self, cfg: &Config) -> BackendResult<String> {
        let token = encode(
            &Header::default(),
            self,
            &EncodingKey::from_secret(cfg.secret.as_ref()),
        )?;
        Ok(token)
    }
}

#[derive(Debug)]
pub enum AuthTokenError {
    BadCount,
    Internal,
    Invalid,
    Missing,
}

/// The JWT header schema including the whitespace separating the schema and the
/// actual token.
const JWT_HEADER_SCHEMA: &str = "Bearer ";

impl<'a, 'r> FromRequest<'a, 'r> for Claims {
    type Error = AuthTokenError;

    fn from_request(req: &'a Request<'r>) -> Outcome<Self, Self::Error> {
        let cfg: State<Config> = req
            .guard::<State<Config>>()
            .map_failure(|_| (Status::BadRequest, AuthTokenError::Internal))?;
        let keys: Vec<_> = req.headers().get("Authorization").collect();
        match keys.len() {
            0 => {
                println!("Token missing for {}", req);
                Outcome::Failure((Status::BadRequest, AuthTokenError::Missing))
            }
            1 => {
                let token = keys[0];
                if !token.starts_with(JWT_HEADER_SCHEMA) {
                    println!("Invalid jwt schema for {}, expected Bearer", req);
                    return Outcome::Failure((
                        Status::BadRequest,
                        AuthTokenError::Missing,
                    ));
                }

                let token = &token[JWT_HEADER_SCHEMA.len()..];
                match Self::from_token(&token, &cfg) {
                    Ok(claims) => Outcome::Success(claims),
                    Err(err) => {
                        println!("Invalid token for {}: {}", req, err);
                        Outcome::Failure((
                            Status::Unauthorized,
                            AuthTokenError::Invalid,
                        ))
                    }
                }
            }
            _ => {
                println!("More than 1 token given for {}", req);
                Outcome::Failure((Status::BadRequest, AuthTokenError::BadCount))
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn it_validates_a_token() -> Result<(), Box<dyn std::error::Error>> {
        let cfg = Config {
            secret: String::from("my awesome secret"),
            expire_in: 100,
            validation_leeway: 60,
        };
        let user = User {
            id: 1,
            username: String::from("foobar"),
            password_hash: String::from("some hash"),
        };
        let token = Claims::from_user(user, &cfg).into_token(&cfg)?;

        assert!(Claims::from_token(&token, &cfg).is_ok());

        Ok(())
    }
}
