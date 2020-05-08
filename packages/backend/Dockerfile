FROM rust:1.43-slim-buster as builder

RUN apt-get update && apt-get install -y build-essential libsqlite3-dev

# Build dependencies first to have them cached.
# Based on https://github.com/rust-lang/cargo/issues/2644#issuecomment-335272535
WORKDIR /usr/src
# Create a dummy project with an initial lib.rs.
RUN USER=root cargo new --lib backend
# Copy files required to build the deps.
COPY Cargo.toml Cargo.lock rust-toolchain /usr/src/backend/
WORKDIR /usr/src/backend
# Build the deps.
RUN cargo build --release

# Now copy src and the diesel migrations. They are required at build by
# embed_migrations! in src/database.rs.
COPY src /usr/src/backend/src
COPY migrations /usr/src/backend/migrations
# Build all binaries.
RUN cargo install --path .

FROM debian:buster-slim
RUN apt-get update && apt-get install -y libsqlite3-dev
COPY --from=builder \
    /usr/local/cargo/bin/backend \
    /usr/local/cargo/bin/change_password \
    /usr/local/cargo/bin/create_user \
    /usr/local/cargo/bin/delete_user \
    /usr/local/bin/
CMD ["backend"]
