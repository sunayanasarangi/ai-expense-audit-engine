import { Router } from 'express';
import { eq } from 'drizzle-orm';
import { validateSchema } from '../middleware/validate.js';
import { registerSchema, loginSchema } from '../schemas/auth.schema.js';
import { db } from '../db/index.js';
import { usersTable } from '../db/schema.js';
import { hashPassword, signToken, verifyPassword } from '../utils/auth.js';

const router = Router();

//POST /register (validateSchema(registerSchema)):
router.post('/register', validateSchema(registerSchema), async (req, res) => {
  const { username, email, password } = req.body;
  const [existingUser] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email));

  if (existingUser) {
    return res.status(409).json({
      error: 'Email already registered',
    });
  }

  const passwordHash = await hashPassword(password);

  const [newUser] = await db
    .insert(usersTable)
    .values({ username, email, passwordHash })
    .returning({
      id: usersTable.id,
      username: usersTable.username,
      email: usersTable.email,
      createdAt: usersTable.createdAt,
    });

  const token = await signToken({
    sub: String(newUser.id),
    email: newUser.email,
  });
  res.status(201).json({
    message: 'Registration successful',
    data: { user: newUser, token: token },
  });
});

//POST /login validateSchema(loginSchema)
router.post('/login', validateSchema(loginSchema), async (req, res) => {
  const { email, password } = req.body;

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email));

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  const token = await signToken({ sub: String(user.id), email: user.email });
  res.status(200).json({
    message: 'Login Successful',
    data: {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
      },
      token: token,
    },
  });
});

export default router;
