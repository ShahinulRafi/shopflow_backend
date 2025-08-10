import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/product.js';

dotenv.config();

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Mount auth routes
app.use('/api/auth', authRoutes);

// Mount product routes
app.use('/api/products', productRoutes);

// Example route
app.get('/', (req, res) => {
  res.json({ message: 'ShopFlow Backend is running' });
});

app.listen(5000, () => console.log('Server running on http://localhost:5000'));
