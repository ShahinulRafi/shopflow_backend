// // import express from 'express';
// // import { PrismaClient } from '@prisma/client';
// // import { authenticateToken, authorizeAdmin } from '../middleware/auth.js';

// // const router = express.Router();
// // const prisma = new PrismaClient();

// // // Get all products (public route)
// // router.get('/', async (req, res) => {
// //   try {
// //     const products = await prisma.product.findMany();
// //     res.json(products);
// //   } catch (error) {
// //     console.error(error);
// //     res.status(500).json({ error: 'Failed to fetch products' });
// //   }
// // });

// // // Create product (admin only)
// // router.post('/', authenticateToken, authorizeAdmin, async (req, res) => {
// //   try {
// //     const productData = req.body;
// //     const product = await prisma.product.create({ data: productData });
// //     res.json(product);
// //   } catch (error) {
// //     console.error(error);
// //     res.status(500).json({ error: 'Failed to create product' });
// //   }
// // });

// // export default router;


// import express from 'express';
// import { PrismaClient } from '@prisma/client';
// import jwt from 'jsonwebtoken';

// const router = express.Router();
// const prisma = new PrismaClient();

// // Middleware to verify JWT and extract user info
// function authenticateToken(req, res, next) {
//   const authHeader = req.headers['authorization'];
//   if (!authHeader) return res.status(401).json({ error: 'Missing Authorization header' });

//   const token = authHeader.split(' ')[1];
//   if (!token) return res.status(401).json({ error: 'Token not found' });

//   jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
//     if (err) return res.status(403).json({ error: 'Invalid token' });
//     req.user = user; // Add decoded user info to request object
//     next();
//   });
// }

// // GET /api/products - Get all products (no auth needed)
// router.get('/', async (req, res) => {
//   try {
//     const products = await prisma.product.findMany();
//     res.json(products);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Failed to fetch products' });
//   }
// });

// // POST /api/products - Create product (admin only)
// router.post('/', authenticateToken, async (req, res) => {
//   try {
//     if (req.user.role !== 'ADMIN') {
//       return res.status(403).json({ error: 'Forbidden - Admins only' });
//     }

//     const { title, description, price, image, category, rating, inStock } = req.body;
//     if (!title || !price || !image || !category) {
//       return res.status(400).json({ error: 'Missing required product fields' });
//     }

//     const product = await prisma.product.create({
//       data: {
//         title,
//         description: description || '',
//         price,
//         image,
//         category,
//         rating: rating || 0,
//         inStock: inStock !== undefined ? inStock : true,
//       }
//     });

//     res.status(201).json(product);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Failed to create product' });
//   }
// });

// // Update product (only admin can do this)
// router.put('/products/:id', async (req, res) => {
//   try {
//     // Get token from header
//     const token = req.headers.authorization?.split(' ')[1];
//     if (!token) return res.status(401).json({ error: 'Unauthorized' });

//     // Verify token and check role
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     if (decoded.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden - Admins only' });

//     // Get product ID from URL params
//     const { id } = req.params;

//     // Get data from request body
//     const data = req.body;

//     // Update product in DB
//     const updatedProduct = await prisma.product.update({
//       where: { id },
//       data,
//     });

//     // Send updated product back
//     res.json(updatedProduct);

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Failed to update product' });
//   }
// });

// // Delete product (only admin can do this)
// router.delete('/products/:id', async (req, res) => {
//   try {
//     // Get token from header
//     const token = req.headers.authorization?.split(' ')[1];
//     if (!token) return res.status(401).json({ error: 'Unauthorized' });

//     // Verify token and check role
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     if (decoded.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden - Admins only' });

//     // Get product ID from URL params
//     const { id } = req.params;

//     // Delete product from DB
//     await prisma.product.delete({
//       where: { id },
//     });

//     // Send success message
//     res.json({ message: 'Product deleted successfully' });

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Failed to delete product' });
//   }
// });

// export default router;


import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, authorizeAdmin } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// GET all products (public)
router.get('/', async (req, res) => {
  try {
    const products = await prisma.product.findMany();
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// POST create product (admin only)
router.post('/', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { title, description, price, image, category, rating, inStock } = req.body;
    if (!title || !price || !image || !category) {
      return res.status(400).json({ error: 'Missing required product fields' });
    }

    const product = await prisma.product.create({
      data: {
        title,
        description: description || '',
        price,
        image,
        category,
        rating: rating || 0,
        inStock: inStock !== undefined ? inStock : true,
      },
    });

    res.status(201).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// PUT update product by id (admin only)
router.put('/:id', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const updatedProduct = await prisma.product.update({
      where: { id },
      data,
    });

    res.json(updatedProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// DELETE product by id (admin only)
router.delete('/:id', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.product.delete({
      where: { id },
    });

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

export default router;
