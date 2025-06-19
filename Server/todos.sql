create table todos (
    id serial primary key,
  title varchar(255) not null,
  descp  varchar(500),
  completed boolean default false,
  created_at timestamp with time zone default current_timestamp,
  updated_at timestamp with time zone default current_timestamp
); 