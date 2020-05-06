create table users
(
  id integer primary key not null,
  username varchar(255) not null unique,
  password_hash text not null
);
create index users__username on users (username);

create table notebooks
(
  notebook_id integer primary key not null,
  notebook_title varchar(255) not null,

  user_id integer references users (id) not null,

  unique (notebook_title, user_id)
);
create index notebooks__user_id__notebook_title
  on notebooks (user_id, notebook_title);

create table sections
(
  section_id integer primary key not null,
  section_title varchar(255) not null,

  notebook_id integer references notebooks (notebook_id) not null,

  unique (section_title, notebook_id)
);
create index sections__notebook_id on sections (notebook_id);

create table pages
(
  page_id integer primary key not null,
  page_title varchar(255) not null,
  content text not null,

  section_id integer references sections (section_id) not null,

  unique (page_title, section_id)
);
create index pages__section_id on pages (section_id);
