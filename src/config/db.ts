import { Pool } from "pg";
import { env } from "./env";

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
});

pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    const nodeErr = err as NodeJS.ErrnoException;
    if (nodeErr.code === "ECONNREFUSED") {
      console.error(
        "PostgreSQL refused the connection (nothing listening on that host/port). " +
          "Start Postgres locally or run: docker compose up -d",
      );
    } else {
      console.error(err);
    }
    process.exit(1);
  }
});