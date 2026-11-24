import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { SignJWT, jwtVerify } from 'jose';

const scryptAsync = promisify(scrypt);
/*if JWT_SECRET is ever missing from .env, it throws an explicit, descriptive error
 *rather than passing undefined into TextEncoder
 */
const getSecretKey = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  return new TextEncoder().encode(process.env.JWT_SECRET);
};
export async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = await scryptAsync(password, salt, 64);
  return `${salt}:${derivedKey.toString('hex')}`;
}

export async function verifyPassword(password, hashedPassword) {
  const [salt, keyHex] = hashedPassword.split(':');
  if (!salt || !keyHex) {
    return false;
  }
  const keyBuffer = Buffer.from(keyHex, 'hex');
  const derivedKey = await scryptAsync(password, salt, 64);
  return keyBuffer.length !== derivedKey.length
    ? false
    : timingSafeEqual(keyBuffer, derivedKey);
}

export async function signToken(payload) {
  const header = {
    alg: 'HS256',
    typ: 'JWT',
  };

  return await new SignJWT(payload)
    .setProtectedHeader(header)
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getSecretKey());
}

export async function verifyToken(token) {
  const { payload } = await jwtVerify(token, getSecretKey());
  return payload;
}
