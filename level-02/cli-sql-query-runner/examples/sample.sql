-- Sample SQL for SQLite demo: creates a table, inserts rows, selects.
drop table if exists people;
create table if not exists people (
  id integer primary key,
  name text not null,
  age integer
);
insert into people (name, age) values
  ('Ada Lovelace', 36),
  ('Grace Hopper', 85),
  ('Katherine Johnson', 101);
select * from people order by id;