use dotenv::dotenv;
use std::error::Error;
use std::io::stdin;

use backend::database;

fn main() -> Result<(), Box<dyn Error>> {
    dotenv().ok();

    // Read the username.
    println!("Enter the username:");
    let mut username = String::new();
    stdin().read_line(&mut username).unwrap();
    // Drop the newline character and remove whitespaces.
    let username = &username[..(username.len() - 1)].trim();
    if username.len() == 0 {
        panic!("Please enter a username")
    }

    // Read the password without printing it using rpassword.
    println!("\nEnter the password for this user:");
    let password = rpassword::read_password().unwrap();
    if password.len() == 0 {
        panic!("Please enter a password")
    }

    // Store the user in the database.
    let database_url = std::env::var("MN_DATABASE_URL")?;
    let pool = backend::database::create_pool(&database_url)?;
    let conn = pool.get()?;
    database::run_migrations(&conn)?;
    let user = backend::user_management::create(&conn, username, &password)?;
    println!("\nSaved user {} (id: {})", user.username, user.id);

    Ok(())
}
