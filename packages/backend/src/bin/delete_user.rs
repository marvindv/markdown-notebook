use diesel::prelude::*;
use dotenv::dotenv;
use std::error::Error;
use std::io::stdin;

use backend::database;
use backend::models::schema::users::dsl::*;
use backend::models::User;

fn main() -> Result<(), Box<dyn Error>> {
    dotenv().ok();

    let database_url = std::env::var("MN_DATABASE_URL")?;
    let pool = backend::database::create_pool(&database_url)?;
    let conn = pool.get()?;
    database::run_migrations(&conn)?;
    let user_list = users.load::<User>(&conn)?;

    println!("Displaying {} users", user_list.len());
    for user in &user_list {
        println!("[{}] {}", user.id, user.username);
    }

    println!("\nEnter the id of the user you want to delete:");
    let mut user_id = String::new();
    stdin().read_line(&mut user_id)?;
    // Remove newline at the end of the input and parse as integer.
    let user_id = &user_id[..(user_id.len() - 1)]
        .trim()
        .parse::<i32>()
        .expect("The id is invalid");

    println!(
        "\nDo you really want to delete user '{}'? (y|N)",
        user_list
            .iter()
            .find(|&user| user.id == *user_id)
            .expect("User not found")
            .username
    );
    let mut choice = String::new();
    stdin().read_line(&mut choice)?;
    choice.make_ascii_lowercase();
    let choice = choice.trim();
    if choice == "y" {
        backend::user_management::delete(&conn, *user_id)?;
        println!("Done!");
    } else {
        println!("Aborted!");
    }

    Ok(())
}
