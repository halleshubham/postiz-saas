import bcrypt from "bcryptjs";
import { prisma } from "./db";
import { sendEmail } from "./email";

export async function hashPassword(plain: string) {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(plain: string, hashed: string) {
  return bcrypt.compare(plain, hashed);
}

export function generateToken(): string {
  const bytes = new Uint8Array(32);
  globalThis.crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function isAdminEmail(email: string): boolean {
  const adminEmails = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim()).filter(Boolean);
  return adminEmails.includes(email);
}

export async function sendVerificationEmail(userId: string, email: string) {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

  await prisma.emailVerificationToken.deleteMany({ where: { userId } });
  await prisma.emailVerificationToken.create({ data: { token, userId, expiresAt } });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const link = `${appUrl}/verify-email?token=${token}`;

  await sendEmail(
    email,
    "Verify your Shacky Social email",
    `Click this link to verify your email: ${link}`,
    `<p>Click <a href="${link}">here</a> to verify your email address. This link expires in 24 hours.</p>`,
  );
}

export async function sendPasswordResetEmail(userId: string, email: string) {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1h

  await prisma.passwordResetToken.deleteMany({ where: { userId } });
  await prisma.passwordResetToken.create({ data: { token, userId, expiresAt } });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const link = `${appUrl}/reset-password?token=${token}`;

  await sendEmail(
    email,
    "Reset your Shacky Social password",
    `Click this link to reset your password: ${link}`,
    `<p>Click <a href="${link}">here</a> to reset your password. This link expires in 1 hour.</p><p>If you didn't request this, ignore this email.</p>`,
  );
}
