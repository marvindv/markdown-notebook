FROM node:12.16-alpine3.9 AS builder

WORKDIR /usr/src/webapp
# First install dependencies to cache them.
COPY package.json yarn.lock ./
RUN yarn install

# Build into /usr/src/webapp/build
COPY . .
RUN yarn build

FROM nginx:1.18-alpine
WORKDIR /var/www/webapp
COPY --from=builder /usr/src/webapp/build/ .
COPY nginx.conf /etc/nginx/
