#![feature(proc_macro_hygiene, decl_macro)]

use dotenv::dotenv;
use rocket::config::{Config, Environment};
use rocket::{get, http::Method, routes};
use rocket_cors::{AllowedHeaders, AllowedOrigins, CorsOptions};
use std::env;
use std::error::Error;

use backend::{api, database, jwt};

fn main() -> Result<(), Box<dyn Error>> {
    dotenv().ok();

    let config = Config::build(Environment::Staging)
        .address(env::var("MN_HOST").unwrap_or(String::from("0.0.0.0")))
        .port(
            env::var("MN_PORT")
                .unwrap_or(String::from("8000"))
                .parse()
                .expect("MN_PORT is not a valid port"),
        )
        .finalize()?;

    let allowed_origins = AllowedOrigins::all();
    let cors = CorsOptions {
        allowed_origins,
        allowed_methods: vec![
            Method::Get,
            Method::Post,
            Method::Put,
            Method::Delete,
        ]
        .into_iter()
        .map(From::from)
        .collect(),
        allowed_headers: AllowedHeaders::some(&[
            "Authorization",
            "Accept",
            "Content-Type",
        ]),
        allow_credentials: true,
        ..Default::default()
    }
    .to_cors()?;

    let db_connection_pool = database::create_pool(
        &env::var("MN_DATABASE_URL")
            .expect("MN_DATABASE_URL env variable missing"),
    )?;

    rocket::custom(config)
        .manage(jwt::Config {
            secret: env::var("MN_JWT_SECRET")
                .expect("MN_JWT_SECRET env variable is missing."),
            expire_in: chrono::Duration::weeks(4).num_seconds(),
            validation_leeway: 60,
        })
        .manage(db_connection_pool)
        .mount("/", routes![index])
        .mount("/api/v1", api::v1::get_routes())
        .attach(cors)
        .launch();

    Ok(())
}

#[get("/")]
fn index() -> &'static str {
    "Hello from markdown-notebook!"
}
