# Markdown Notebook

markdown-notebook is a self-hosted web application to organize and write your
notes in Markdown. It allows you to create multiple users whose notes are
organized in files and nested in directories as they like.

The backend stores all notes in a SQLite database file.

## Docker deployment

The simplest way to deploy this is by using the prebuild docker images on
Docker Hub for the backend, webapp and load-balancer.

First make sure you have Docker and `docker-compose` installed.

Create a `.env` file derived from `.env.template` in an empty directory and fill
in a random jwt secret and the path to the directory where the database file
should be stored on the host. It should look like this:

```dotenv
JWT_SECRET=<some random secret>
PORT=8430
DATABASE_STORAGE_DIR=/var/lib/markdown-notebook
```

Then copy `docker-compose.yml` from this repository into the same directory.

Now the project can be run using `docker-compose`. All commands are executed
in the directory that contains a valid `.env` and the `docker-compose.yml` file:

```bash
# Start webapp, backend and load balancer and show the aggregated output of all
# services.
$ docker-compose up

# Start webapp, backend and load balancer in the background.
$ docker-compose up -d

# Stop all services.
$ docker-compose stop

# Stop and remove services.
$ docker-compose down
```

Unless you modify the compose file the services will be restarted in case they
crash or on reboot as long as they are not stopped manually.

To update to the latest version of all services, run the following commands:

```bash
$ docker-compose stop
$ docker-compose pull
$ docker-compose up -d
```

Creating and deleting a user as well as changing the password is possible using
the binaries bundled with the backend service.

```bash
# Create a user:
$ docker-compose run backend create_user

# Change the password of a user:
$ docker-compose run backend change_password

# Delete a user:
$ docker-compose run backend delete_user
```

## Docker deployment from source

If you wish to deploy from source clone this repository, create a `.env` file
based on `.env.template` as described above and pass the
`docker-compose.build.yml` compose file to `docker-compose` using the `-f`
option.

Additional to the commands described above this might be helpful:

```bash
# Rebuild the images after changes to the source of one or more services.
$ app_version=`git rev-parse --short HEAD` docker-compose -f docker-compose.build.yml build
```

## Install build tools and dependencies

### Frontend

The following tools are required:

- Node.js 12 with NPM
- [Yarn](https://yarnpkg.com/getting-started/install)
  - Install with `npm install -g yarn`
- TypeScript
  - Install with `npm install -g typescript`

To install all dependencies, run:

```bash
$ cd packages/webapp
$ yarn install
```

### Backend

For development `rust`, `cargo` as well as the `diesel-cli` must be
installed.

- [Install rust and cargo](https://www.rust-lang.org/learn/get-started)
- Install the `diesel-cli` with

```bash
$ cargo install diesel_cli --no-default-features --features sqlite
```

If this fails with errors like

```
note: ld: library not found for -lmysqlclient
clang: error: linker command failed with exit code 1 (use -v to see invocation)
```

it means you are missing the required client libraries. The exact details on
installing them can currently be found in [https://github.com/diesel-rs/diesel/blob/master/guide_drafts/backend_installation.md](https://github.com/diesel-rs/diesel/blob/master/guide_drafts/backend_installation.md).

For example on Debian based linux distributions run

```bash
$ sudo apt install libsqlite3-dev
```

for the client library for sqlite.
