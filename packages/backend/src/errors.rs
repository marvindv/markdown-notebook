use diesel::r2d2;
use diesel::result::DatabaseErrorKind;
use rocket::config::Environment;
use rocket::http::Status;
use rocket::response::Responder;
use rocket::{Request, Response};
use std::fmt;
use std::io::Cursor;

pub type BackendResult<T> = Result<T, BackendError>;

#[derive(Debug)]
pub enum BackendError {
    Bcrypt(bcrypt::BcryptError),
    Diesel(diesel::result::Error),
    DieselConnectionError(diesel::ConnectionError),
    DieselMigration(diesel_migrations::RunMigrationsError),
    R2D2(r2d2::Error),
    /// This encapsulates the actual ::r2d2::Error, which is re-exported by
    /// diesel as diesel::r2d2::PoolError.
    R2D2Pool(r2d2::PoolError),
    EnvError(std::env::VarError),
    JwtError(jsonwebtoken::errors::Error),
    RocketCors(rocket_cors::Error),
    InvalidCredentials,
    InvalidValue,
    NotFound,
    Conflict,
}

impl BackendError {
    pub fn status(&self) -> Status {
        match self {
            BackendError::InvalidCredentials => Status::Unauthorized,
            BackendError::InvalidValue => Status::UnprocessableEntity,
            BackendError::NotFound => Status::NotFound,
            BackendError::Diesel(diesel::result::Error::NotFound) => {
                Status::NotFound
            }
            BackendError::Conflict => Status::Conflict,
            BackendError::Diesel(diesel::result::Error::DatabaseError(
                DatabaseErrorKind::UniqueViolation,
                _,
            )) => Status::Conflict,
            _ => Status::InternalServerError,
        }
    }
}

impl fmt::Display for BackendError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            BackendError::Bcrypt(err) => write!(f, "Bcrypt error: {}", err),
            BackendError::Diesel(err) => write!(f, "Diesel error: {}", err),
            BackendError::DieselConnectionError(err) => {
                write!(f, "Diesel connection error: {}", err)
            }
            BackendError::DieselMigration(err) => {
                write!(f, "Diesel migration error: {}", err)
            }
            BackendError::R2D2(err) => write!(f, "r2d2 error: {}", err),
            BackendError::R2D2Pool(err) => {
                write!(f, "r2d2 pool error: {}", err)
            }
            BackendError::EnvError(err) => write!(f, "Env var error: {}", err),
            BackendError::JwtError(err) => write!(f, "JWT error: {}", err),
            BackendError::RocketCors(err) => {
                write!(f, "rocket cors error: {}", err)
            }
            BackendError::InvalidCredentials => {
                write!(f, "Invalid credentials")
            }
            BackendError::InvalidValue => write!(f, "Invalid value"),
            BackendError::NotFound => write!(f, "Entity not found"),
            BackendError::Conflict => write!(f, "Conflict"),
        }
    }
}

impl std::error::Error for BackendError {
    #[allow(deprecated)]
    fn description(&self) -> &str {
        match self {
            BackendError::Bcrypt(err) => err.description(),
            BackendError::Diesel(err) => err.description(),
            BackendError::DieselConnectionError(err) => err.description(),
            BackendError::DieselMigration(err) => err.description(),
            BackendError::R2D2(err) => err.description(),
            BackendError::R2D2Pool(err) => err.description(),
            BackendError::EnvError(err) => err.description(),
            BackendError::JwtError(err) => err.description(),
            BackendError::RocketCors(err) => err.description(),
            BackendError::InvalidCredentials => "Invalid credentials",
            BackendError::InvalidValue => "Invalid value",
            BackendError::NotFound => "Entity not found",
            BackendError::Conflict => "Conflict",
        }
    }
}

impl Responder<'static> for BackendError {
    fn respond_to(self, _: &Request) -> Result<Response<'static>, Status> {
        let status = self.status();
        println!("Respond {} for error \"{}\"", status, self);

        match Environment::active() {
            Ok(Environment::Development) => Response::build()
                .status(status)
                .sized_body(Cursor::new(format!("{{ \"err\": \"{}\" }}", self)))
                .ok(),
            _ => Response::build().status(status).ok(),
        }
    }
}

macro_rules! impl_from_error {
    ($from_err: ty, $err_variant: expr) => {
        impl From<$from_err> for BackendError {
            fn from(err: $from_err) -> BackendError {
                $err_variant(err)
            }
        }
    };
}

impl_from_error!(bcrypt::BcryptError, BackendError::Bcrypt);
impl_from_error!(diesel::ConnectionError, BackendError::DieselConnectionError);
impl_from_error!(
    diesel_migrations::RunMigrationsError,
    BackendError::DieselMigration
);
impl_from_error!(std::env::VarError, BackendError::EnvError);
impl_from_error!(jsonwebtoken::errors::Error, BackendError::JwtError);
impl_from_error!(r2d2::Error, BackendError::R2D2);
impl_from_error!(r2d2::PoolError, BackendError::R2D2Pool);
impl_from_error!(rocket_cors::Error, BackendError::RocketCors);

// Directly convert some diesel errors into our custom errors.
impl From<diesel::result::Error> for BackendError {
    fn from(err: diesel::result::Error) -> BackendError {
        match err {
            diesel::result::Error::NotFound => BackendError::NotFound,
            diesel::result::Error::DatabaseError(
                DatabaseErrorKind::UniqueViolation,
                _,
            ) => BackendError::Conflict,
            _ => BackendError::Diesel(err),
        }
    }
}
