use dotenv::dotenv;
use std::error::Error;
use std::io::stdin;

use backend::database;

fn main() -> Result<(), Box<dyn Error>> {
    dotenv().ok();

    println!("Creating a new user.");
    // Read the username.
    println!("Username:");
    let mut username = String::new();
    stdin().read_line(&mut username).unwrap();
    // Drop the newline character and remove whitespaces.
    let username = &username[..(username.len() - 1)].trim();
    if username.is_empty() {
        panic!("Enter a username")
    }

    // Read the password without printing it using rpassword.
    println!("Password:");
    let password = rpassword::read_password().unwrap();
    if password.is_empty() {
        panic!("Please enter a password")
    }

    // Store the user in the database.
    let database_url = std::env::var("MN_DATABASE_URL")?;
    let pool = backend::database::create_pool(&database_url)?;
    let conn = pool.get()?;
    database::run_migrations(&conn)?;
    let user = backend::user_management::create(&conn, username, &password)?;
    println!("Saved user {} (id: {}).", user.username, user.id);

    Ok(())
}
