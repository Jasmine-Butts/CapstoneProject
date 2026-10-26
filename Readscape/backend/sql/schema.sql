CREATE TABLE IF NOT EXISTS readscape_users (
 id BIGSERIAL PRIMARY KEY,
 name TEXT NOT NULL,
 username TEXT NOT NULL,
 email TEXT NOT NULL,
 password_hash TEXT NOT NULL,
 created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS readscape_username_unique ON readscape_users (lower(username));
CREATE UNIQUE INDEX IF NOT EXISTS readscape_email_unique ON readscape_users (lower(email));
CREATE TABLE IF NOT EXISTS readscape_books (
 id TEXT PRIMARY KEY,
 title TEXT NOT NULL,
 authors JSONB NOT NULL DEFAULT '[]',
 description TEXT NOT NULL DEFAULT '',
 categories JSONB NOT NULL DEFAULT '[]',
 pages INTEGER NOT NULL DEFAULT 0 CHECK (pages >= 0),
 cover TEXT NOT NULL DEFAULT ''
);
CREATE TABLE IF NOT EXISTS readscape_user_books (
 user_id BIGINT NOT NULL REFERENCES readscape_users(id) ON DELETE CASCADE,
 book_id TEXT NOT NULL REFERENCES readscape_books(id),
 status TEXT NOT NULL DEFAULT 'want' CHECK (status IN ('want','reading','finished')),
 current_page INTEGER NOT NULL DEFAULT 0 CHECK (current_page >= 0),
 added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 PRIMARY KEY (user_id, book_id)
);
