# markdown-notes/backend

## Configuration

The configuration is provided via environment variables.

- `MN_JWT_SECRET` (required): The secret used to sign the json web tokens used for authentication.
- `MN_DATABASE_URL` (required): The database url for the database. In case of sqlite, this is the path to the sqlite file.
- `MN_HOST` (defaults to `0.0.0.0`): The address the backend will listen on.
- `MN_PORT` (defaults to `8000`): The port the backend will listen on.
