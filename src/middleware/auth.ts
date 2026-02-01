import { jwtVerify, SignJWT } from 'jose';
import type { Env } from '../types';

export async function createToken(env: Env): Promise<string> {
  const secret = new TextEncoder().encode(env.JWT_SECRET || env.DASHBOARD_PASSWORD);
  
  return await new SignJWT({ authenticated: true })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secret);
}

export async function verifyAuth(request: Request, env: Env): Promise<boolean> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }

  const token = authHeader.split(' ')[1];
  const secret = new TextEncoder().encode(env.JWT_SECRET || env.DASHBOARD_PASSWORD);

  try {
    if (!token) return false;
    await jwtVerify(token, secret);
    return true;
  } catch (e) {
    return false;
  }
}
