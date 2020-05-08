# markdown-notes/backend

## Configuration

The configuration is provided via environment variables.

- `MN_JWT_SECRET` (required): The secret used to sign the json web tokens used for authentication.
- `MN_DATABASE_URL` (required): The database url for the database. In case of sqlite, this is the path to the sqlite file.
- `MN_HOST` (defaults to `0.0.0.0`): The address the backend will listen on.
- `MN_PORT` (defaults to `8000`): The port the backend will listen on.

## Deployment

```bash
# Create an image for the backend.
$ docker build -t markdown-notebook/backend .
# Run the image interactive.
$ docker run -it --rm -p 8000:8000 \
  -e MN_JWT_SECRET=myawesomesecret \
  -e MN_DATABASE_URL=/data/notebooks.sqlite \
  -v `pwd`/data:/data \
  markdown-notebook/backend

# Run the image as a daemon.
$ docker run -d markdown-notebook/backend
```

You can also access the associated binaries `create_user`, `change_password` and
`delete_user` like so:

```bash
$ docker run -it --rm \
  -e MN_JWT_SECRET=myawesomesecret \
  -e MN_DATABASE_URL=/data/notebooks.sqlite \
  -v `pwd`/data:/data \
  markdown-notebook/backend \
  create_user
```
