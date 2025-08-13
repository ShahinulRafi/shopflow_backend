// routes/auth.js
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Get user by email (temporary debug endpoint)
router.get('/user/:email', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email: req.params.email }
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ 
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reset password (temporary endpoint for fixing admin user)
router.post('/reset-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword }
    });
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Register
router.post('/register', async (req, res) => {
  try {
    console.log('Registration request:', req.body); // Debug log
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    console.log('Creating user with role:', req.body.role); // Debug log
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: req.body.role === 'ADMIN' ? 'ADMIN' : 'USER'
      },
    });
    console.log('Created user:', user); // Debug log

    // Token keeps uppercase for middleware
    const token = jwt.sign(
      { userId: user.id, role: user.role.toUpperCase() },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // ↓↓↓ Return LOWERCASE role to the frontend
    res.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role.toLowerCase() },
      token,
    });
  } catch (error) {
    console.error('Registration error:', error.message);
    console.error(error.stack);
    res.status(500).json({ error: 'Registration failed: ' + error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: 'Invalid credentials' });

    // Token keeps uppercase for middleware
    const token = jwt.sign(
      { userId: user.id, role: user.role.toUpperCase() },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // ↓↓↓ Return LOWERCASE role to the frontend
    res.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role.toLowerCase() },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

export default router;
