#![feature(proc_macro_hygiene, decl_macro)]

#[macro_use]
extern crate diesel;
#[macro_use]
extern crate diesel_migrations;

pub mod api;
pub mod database;
pub mod errors;
pub mod jwt;
pub mod models;
pub mod user_management;

pub use crate::database::{DbConnection, DbConnectionPool};
pub use crate::errors::{BackendError, BackendResult};
