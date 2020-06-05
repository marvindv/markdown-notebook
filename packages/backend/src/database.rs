use crate::BackendResult;
use diesel::prelude::*;
use diesel::r2d2::{self, CustomizeConnection};

embed_migrations!();

/// This type represents a database provider agnostic connection handle.
pub type DbConnection = diesel::sqlite::SqliteConnection;

/// The type of the database pool to get connections from. Use as a route guard
/// to get the applications connection pool.
pub type DbConnectionPool =
    r2d2::Pool<r2d2::ConnectionManager<diesel::sqlite::SqliteConnection>>;

#[derive(Debug)]
struct SqliteConnectionCustomizer;

impl CustomizeConnection<DbConnection, r2d2::Error>
    for SqliteConnectionCustomizer
{
    fn on_acquire(&self, conn: &mut DbConnection) -> Result<(), r2d2::Error> {
        // Ensure that for every connection foreign keys are enforced.
        // See https://www.sqlite.org/foreignkeys.html#fk_enable
        match conn.execute("PRAGMA foreign_keys = ON;") {
            Ok(_) => Ok(()),
            Err(err) => Err(r2d2::Error::QueryError(err)),
        }
    }
}

/// Creates a database connection pool using the provided connection string to
/// connect to the database.
///
/// General usage is:
///
/// ```ignore
/// let database_url = std::env::var("MN_DATABASE_URL").unwrap();
/// let db_pool = backend::database::create_pool(&database_url).unwrap();
/// let connection = db_pool.get().unwrap();
/// ```
pub fn create_pool(database_url: &str) -> BackendResult<DbConnectionPool> {
    let manager =
        r2d2::ConnectionManager::<diesel::sqlite::SqliteConnection>::new(
            database_url,
        );
    let pool = r2d2::Pool::builder()
        // Since sqlite only supports one write at a time, concurrent write
        // tries result in a database locked error by diesel. To avoid
        // that, for now just use at max 1 connection. This could be
        // improved by either retrying on that error or use another
        // connection pool just for read operations.
        .max_size(1)
        .connection_customizer(Box::new(SqliteConnectionCustomizer))
        .build(manager)?;
    Ok(pool)
}

/// Checks whether there are pending migrations for the connected database and
/// if so executes them.
pub fn run_migrations(conn: &DbConnection) -> BackendResult<()> {
    embedded_migrations::run_with_output(&*conn, &mut std::io::stdout())?;
    Ok(())
}
