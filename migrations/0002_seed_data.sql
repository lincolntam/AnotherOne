-- Seed AnotherOne data for the existing global_login user table.
-- The owner account is reused from the existing login data.

update users
set role = 'admin'
where lower(email) = 'lincolntam56@hotmail.com';

insert or ignore into categories (id, user_id, name, description, display_order)
select 'cat_search', cast(id as text), 'Search', 'Everyday search tools', 1
from users
where lower(email) = 'lincolntam56@hotmail.com'
limit 1;

insert or ignore into categories (id, user_id, name, description, display_order)
select 'cat_media', cast(id as text), 'Media', 'Video and streaming', 2
from users
where lower(email) = 'lincolntam56@hotmail.com'
limit 1;

insert or ignore into categories (id, user_id, name, description, display_order)
select 'cat_work', cast(id as text), 'Work', 'Workspaces and communication', 3
from users
where lower(email) = 'lincolntam56@hotmail.com'
limit 1;

insert or ignore into categories (id, user_id, name, description, display_order)
select 'cat_social', cast(id as text), 'Social', 'Professional networks', 4
from users
where lower(email) = 'lincolntam56@hotmail.com'
limit 1;

insert or ignore into categories (id, user_id, name, description, display_order)
select 'cat_ai', cast(id as text), 'AI', 'AI assistants and tools', 5
from users
where lower(email) = 'lincolntam56@hotmail.com'
limit 1;

insert or ignore into website_shortcuts
  (id, user_id, title, description, url, image_url, category, display_order, active, favorite, pinned, created_at, updated_at)
select 'web_google', cast(id as text), 'Google', 'Search the web quickly.', 'https://google.com', 'https://www.google.com/favicon.ico', 'Search', 1, 1, 1, 1, datetime('now'), datetime('now')
from users where lower(email) = 'lincolntam56@hotmail.com' limit 1;

insert or ignore into website_shortcuts
  (id, user_id, title, description, url, image_url, category, display_order, active, favorite, pinned, created_at, updated_at)
select 'web_youtube', cast(id as text), 'YouTube', 'Videos and subscriptions.', 'https://youtube.com', 'https://www.youtube.com/favicon.ico', 'Media', 2, 1, 1, 0, datetime('now'), datetime('now')
from users where lower(email) = 'lincolntam56@hotmail.com' limit 1;

insert or ignore into website_shortcuts
  (id, user_id, title, description, url, image_url, category, display_order, active, favorite, pinned, created_at, updated_at)
select 'web_github', cast(id as text), 'GitHub', 'Source code repository.', 'https://github.com', 'https://github.githubassets.com/favicons/favicon.svg', 'Work', 3, 1, 1, 1, datetime('now'), datetime('now')
from users where lower(email) = 'lincolntam56@hotmail.com' limit 1;

insert or ignore into website_shortcuts
  (id, user_id, title, description, url, image_url, category, display_order, active, favorite, pinned, created_at, updated_at)
select 'web_chatgpt', cast(id as text), 'ChatGPT', 'AI assistant workspace.', 'https://chatgpt.com', 'https://chatgpt.com/favicon.ico', 'AI', 4, 1, 1, 1, datetime('now'), datetime('now')
from users where lower(email) = 'lincolntam56@hotmail.com' limit 1;

insert or ignore into website_shortcuts
  (id, user_id, title, description, url, image_url, category, display_order, active, favorite, pinned, created_at, updated_at)
select 'web_outlook', cast(id as text), 'Outlook', 'Email and calendar.', 'https://outlook.office.com', 'https://outlook.office.com/favicon.ico', 'Work', 5, 1, 0, 0, datetime('now'), datetime('now')
from users where lower(email) = 'lincolntam56@hotmail.com' limit 1;

insert or ignore into website_shortcuts
  (id, user_id, title, description, url, image_url, category, display_order, active, favorite, pinned, created_at, updated_at)
select 'web_teams', cast(id as text), 'Microsoft Teams', 'Team chat and meetings.', 'https://teams.microsoft.com', 'https://teams.microsoft.com/favicon.ico', 'Work', 6, 1, 0, 0, datetime('now'), datetime('now')
from users where lower(email) = 'lincolntam56@hotmail.com' limit 1;

insert or ignore into website_shortcuts
  (id, user_id, title, description, url, image_url, category, display_order, active, favorite, pinned, created_at, updated_at)
select 'web_sharepoint', cast(id as text), 'SharePoint', 'Documents and team sites.', 'https://www.microsoft365.com/launch/sharepoint', 'https://www.microsoft.com/favicon.ico', 'Work', 7, 1, 0, 0, datetime('now'), datetime('now')
from users where lower(email) = 'lincolntam56@hotmail.com' limit 1;

insert or ignore into website_shortcuts
  (id, user_id, title, description, url, image_url, category, display_order, active, favorite, pinned, created_at, updated_at)
select 'web_onedrive', cast(id as text), 'OneDrive', 'Cloud files and sharing.', 'https://onedrive.live.com', 'https://onedrive.live.com/favicon.ico', 'Work', 8, 1, 0, 0, datetime('now'), datetime('now')
from users where lower(email) = 'lincolntam56@hotmail.com' limit 1;

insert or ignore into website_shortcuts
  (id, user_id, title, description, url, image_url, category, display_order, active, favorite, pinned, created_at, updated_at)
select 'web_linkedin', cast(id as text), 'LinkedIn', 'Professional network.', 'https://linkedin.com', 'https://www.linkedin.com/favicon.ico', 'Social', 9, 1, 0, 0, datetime('now'), datetime('now')
from users where lower(email) = 'lincolntam56@hotmail.com' limit 1;
