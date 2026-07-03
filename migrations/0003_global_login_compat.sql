-- Map the existing global_login users table to AnotherOne's expected auth shape.

drop view if exists ao_users_view;

create view ao_users_view as
select
  cast(id as text) as id,
  lower(email) as email,
  coalesce(username, email) as name,
  null as avatar_url,
  case when role = 'admin' then 'admin' else 'user' end as role,
  password as password_hash,
  created_at,
  1 as active
from users;
