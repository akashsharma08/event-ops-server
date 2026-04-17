import crypto from "node:crypto";
import { pool } from "../../config/db";

function randomSixDigitCode(): string {
  return String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");
}

export async function createRegistrationOtp(userId: number): Promise<string> {
  const code = randomSixDigitCode();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  await pool.query(
    `INSERT INTO registration_otps (user_id, code, expires_at)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id) DO UPDATE
       SET code = EXCLUDED.code,
           expires_at = EXCLUDED.expires_at`,
    [userId, code, expiresAt.toISOString()],
  );

  return code;
}

/**
 * Wire SendGrid / Twilio etc. here. For now we log so local dev can complete the flow.
 */
export async function sendRegistrationOtp(params: {
  email?: string | null;
  phone?: string | null;
  code: string;
}): Promise<void> {
  if (params.email) {
    console.info(
      `[OTP email → ${params.email}] code=${params.code} (integrate email provider)`,
    );
  }
  if (params.phone) {
    console.info(
      `[OTP SMS → ${params.phone}] code=${params.code} (integrate SMS provider)`,
    );
  }
}
