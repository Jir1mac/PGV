import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from './prisma.js';

const JWT_SECRET = process.env.ADMIN_JWT_SECRET;
if (!JWT_SECRET) console.warn('ADMIN_JWT_SECRET not set — admin auth will fail without it');

export async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

export function signToken(payload, opts = {}) {
  if (!JWT_SECRET) throw new Error('Missing ADMIN_JWT_SECRET');
  return jwt.sign(payload, JWT_SECRET, { expiresIn: opts.expiresIn || '8h' });
}

export function verifyToken(token) {
  if (!JWT_SECRET) throw new Error('Missing ADMIN_JWT_SECRET');
  return jwt.verify(token, JWT_SECRET);
}

export async function getAdminByUsername(username) {
  return prisma.admin.findUnique({ where: { username } });
}

export async function createAdmin(username, passwordHash) {
  return prisma.admin.create({ data: { username, passwordHash } });
}