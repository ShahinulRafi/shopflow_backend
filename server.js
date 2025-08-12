// //server.js
// import express from 'express';
// import cors from 'cors';
// import dotenv from 'dotenv';
// import { PrismaClient } from '@prisma/client';
// import authRoutes from './routes/auth.js';
// import productRoutes from './routes/product.js';

// dotenv.config();

// const app = express();
// const prisma = new PrismaClient();

// app.use(cors());
// app.use(express.json());

// // Mount auth routes
// app.use('/api/auth', authRoutes);

// // Mount product routes
// app.use('/api/products', productRoutes);

// // Example route
// app.get('/', (req, res) => {
//   res.json({ message: 'ShopFlow Backend is running' });
// });

// app.listen(5000, () => console.log('Server running on http://localhost:5000'));

// server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

import authRoutes from './routes/auth.js';
import productRoutes from './routes/product.js';
import orderRoutes from './routes/orders.js';

dotenv.config(); // load .env first

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Mount routes AFTER app is created
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

app.get('/', (_req, res) => {
  res.json({ message: 'ShopFlow Backend is running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

// (optional) tidy shutdown for Prisma
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
