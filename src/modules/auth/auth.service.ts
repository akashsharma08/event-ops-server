import bcrypt from "bcrypt";
import { pool } from "../../config/db";

export const loginUser = async (email: string, password: string) => {
  const result = await pool.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);

  const user = result.rows[0];

  if (!user) {
    throw new Error("User not found");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  return user;
};

export const saveRefreshToken = async (userId: number, token: string) => {
  await pool.query(
    "INSERT INTO refresh_tokens (user_id, token) VALUES ($1, $2)",
    [userId, token],
  );
};

export const deleteRefreshToken = async (token: string) => {
  await pool.query("DELETE FROM refresh_tokens WHERE token = $1", [token]);
};

export const registerUser = async (input: {
  name: string;
  password: string;
  email?: string;
  phone?: string;
}) => {
  const { name, password, email, phone } = input;

  const conditions: string[] = [];
  const params: unknown[] = [];
  let i = 1;

  if (email) {
    conditions.push(`email = $${i++}`);
    params.push(email);
  }
  if (phone) {
    conditions.push(`phone = $${i++}`);
    params.push(phone);
  }

  if (conditions.length === 0) {
    throw new Error("Email or phone required");
  }

  const existingUser = await pool.query(
    `SELECT id FROM users WHERE ${conditions.join(" OR ")}`,
    params,
  );

  if (existingUser.rows.length > 0) {
    throw new Error("User already exists");
  }

  const hashed = await bcrypt.hash(password, 10);

  const result = await pool.query(
    `INSERT INTO users (name, email, password, phone)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, email, phone`,
    [name, email ?? null, hashed, phone ?? null],
  );

  return result.rows[0];
};
