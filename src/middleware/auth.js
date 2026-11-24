//requireAuth Middleware to lock down /expenses routes so every expense belongs to the authenticated user:

import { verifyToken } from '../utils/auth.js';

export async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer '))
    return res.status(401).json({ error: 'Authorization token required' });

  // Separation of concerns: verifyToken() in utils stays a pure crypto helper that
  // throws (in other words raises an exception / rejects when something goes wrong) on
  // invalid/expired JWTs, while this HTTP middleware translates those errors into a 401 response.

  //Bearer eyJhbGciOiJIUzI1NiJ9... slice(7) strips off the first 7 character and returns the token
  const token = authHeader.slice(7);

  try {
    const payload = await verifyToken(token);
    req.user = {
      //converts payload.sub back into a numeric id (Number(payload.sub))
      id: Number(payload.sub),
      email: payload.email,
    };
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}
