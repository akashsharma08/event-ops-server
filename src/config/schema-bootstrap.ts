import { pool } from "./db";

/**
 * Best-effort idempotent DDL so auth flows work against a fresh or evolving DB.
 */
export async function ensureAuthSchema(): Promise<void> {
  await pool.query(
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(255)`,
  );

  await pool.query(
    `ALTER TABLE users ALTER COLUMN email DROP NOT NULL`,
  );

  await pool.query(`
    CREATE TABLE IF NOT EXISTS registration_otps (
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      code VARCHAR(6) NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      PRIMARY KEY (user_id)
    )
  `);
}
