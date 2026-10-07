import crypto from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import type { PublicUser } from "../lib/types";
import { findUser } from "./users";

export const COOKIE_NAME = "lc_session";
const SECRET = process.env.SESSION_SECRET ?? "dev-only-secret-change-me";
const MAX_AGE_MS = 1000 * 60 * 60 * 24 * 7;

function sign(value: string): string {
  return crypto.createHmac("sha256", SECRET).update(value).digest("base64url");
}

/** Token format: <userId>.<issuedAtMs>.<signature> */
export function createToken(userId: string): string {
  const payload = `${userId}.${Date.now()}`;
  return `${payload}.${sign(payload)}`;
}

export function verifyToken(token: string | undefined): PublicUser | undefined {
  if (!token) return undefined;
  const parts = token.split(".");
  if (parts.length !== 3) return undefined;
  const [userId, issuedAt, signature] = parts;
  const expected = sign(`${userId}.${issuedAt}`);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return undefined;
  if (Date.now() - Number(issuedAt) > MAX_AGE_MS) return undefined;
  return findUser(userId);
}

export function readCookie(req: Request, name: string): string | undefined {
  const header = req.headers.cookie;
  if (!header) return undefined;
  for (const part of header.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return decodeURIComponent(rest.join("="));
  }
  return undefined;
}

export function setSessionCookie(res: Response, userId: string): void {
  res.cookie(COOKIE_NAME, createToken(userId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production" && process.env.COOKIE_SECURE === "true",
    maxAge: MAX_AGE_MS,
    path: "/",
  });
}

export function clearSessionCookie(res: Response): void {
  res.clearCookie(COOKIE_NAME, { path: "/" });
}

export function currentUser(res: Response): PublicUser {
  return res.locals.user as PublicUser;
}

export function requireUser(req: Request, res: Response, next: NextFunction): void {
  const user = verifyToken(readCookie(req, COOKIE_NAME));
  if (!user) {
    res.status(401).json({ error: "Not signed in" });
    return;
  }
  res.locals.user = user;
  next();
}
