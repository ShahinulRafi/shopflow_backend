// // server.js
// import express from 'express';
// import cors from 'cors';
// import dotenv from 'dotenv';
// import { PrismaClient } from '@prisma/client';

// import authRoutes from './routes/auth.js';
// import productRoutes from './routes/product.js';
// import orderRoutes from './routes/orders.js';

// dotenv.config(); // load .env first

// const app = express();
// const prisma = new PrismaClient();

// app.use(cors());
// app.use(express.json());

// // Mount routes AFTER app is created
// app.use('/api/auth', authRoutes);
// app.use('/api/products', productRoutes);
// app.use('/api/orders', orderRoutes);

// app.get('/', (_req, res) => {
//   res.json({ message: 'ShopFlow Backend is running' });
// });

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

// // (optional) tidy shutdown for Prisma
// process.on('SIGINT', async () => {
//   await prisma.$disconnect();
//   process.exit(0);
// });

// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/product.js";
import orderRoutes from "./routes/orders.js";

dotenv.config(); // Load .env first

const app = express();
const prisma = new PrismaClient();

// Allowed origins for CORS
const allowedOrigins = [
  "http://localhost:3000", // local frontend
  process.env.FRONTEND_URL, // production frontend URL from .env
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true, // required for cookies/auth headers
  })
);

// Parse JSON
app.use(express.json());

// Mount routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);

// Health check
app.get("/", (_req, res) => {
  res.json({ message: "ShopFlow Backend is running" });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

// Tidy shutdown for Prisma
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
