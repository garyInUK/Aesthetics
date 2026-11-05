-- Run once in dbs16313357. Does not remove existing tables or data.
CREATE TABLE IF NOT EXISTS site_settings (
 setting_key VARCHAR(64) NOT NULL PRIMARY KEY,
 setting_value TEXT NOT NULL,
 updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
