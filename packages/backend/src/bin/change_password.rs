use diesel::prelude::*;
use dotenv::dotenv;
use std::error::Error;
use std::io::stdin;

use backend::database;
use backend::models::*;

fn main() -> Result<(), Box<dyn Error>> {
    dotenv().ok();

    use backend::models::schema::users::dsl::*;

    let database_url = std::env::var("MN_DATABASE_URL")?;
    let pool = backend::database::create_pool(&database_url)?;
    let conn = pool.get()?;
    database::run_migrations(&conn)?;
    let user_list = users.load::<User>(&conn)?;

    println!("Change password for a user.");
    println!("Displaying {} users:", user_list.len());
    for user in &user_list {
        println!("[{}] {}", user.id, user.username);
    }

    println!("\nID of the user you want to change the password for:");
    let mut user_id = String::new();
    stdin().read_line(&mut user_id).unwrap();
    let user_id = &user_id[..(user_id.len() - 1)]
        .trim()
        .parse::<i32>()
        .expect("The id is invalid");

    println!(
        "Changing password for {}.",
        user_list
            .iter()
            .find(|&user| user.id == *user_id)
            .expect("User not found")
            .username
    );
    println!("New password:");
    let password = rpassword::read_password().unwrap();
    backend::user_management::change_password(&conn, *user_id, &password)?;
    println!("Password changed.");

    Ok(())
}
