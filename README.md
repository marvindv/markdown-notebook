# Markdown Notebook

## Install build tools and dependencies

### Frontend

The following tools are required:

- Node.js 12 with NPM
- [Yarn](https://yarnpkg.com/getting-started/install)
  - Install with `npm install -g yarn`
- TypeScript
  - Install with `npm install -g typescript`

To install all dependencies, run

```bash
$ yarn install
```

from the **repository root**.

### Backend

For development `rust`, `cargo` as well as the `diesel-cli` must be
installed.

- [Install rust and cargo](https://www.rust-lang.org/learn/get-started)
- Install the `diesel-cli` with

```bash
$ cargo install diesel_cli --no-default-features --features postgres,sqlite
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
$ sudo apt install libsqlite3-dev libpq-dev
```

for the client libraries of sqlite and postgres.
