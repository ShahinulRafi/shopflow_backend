// import express from 'express';
// import { PrismaClient } from '@prisma/client';
// import { authenticateToken, authorizeAdmin } from '../middleware/auth.js';

// const router = express.Router();
// const prisma = new PrismaClient();

// // GET all products (public)
// router.get('/', async (req, res) => {
//   try {
//     const products = await prisma.product.findMany();
//     res.json(products);
//   } catch (error) {
//     console.error('Error fetching products:', error);
//     res.status(500).json({ error: 'Failed to fetch products' });
//   }
// });

// // POST create product (admin only)
// router.post('/', authenticateToken, authorizeAdmin, async (req, res) => {
//   try {
//     const { title, description, price, image, category, rating, inStock } = req.body;

//     // Validate required fields
//     if (!title || !price || !image || !category) {
//       return res.status(400).json({ error: 'Missing required product fields' });
//     }

//     // Create the product in the database
//     const product = await prisma.product.create({
//       data: {
//         title,
//         description: description || '',
//         price,
//         image, // Image URL
//         category,
//         rating: rating || 0,
//         inStock: inStock !== undefined ? inStock : true,
//       },
//     });

//     res.status(201).json(product); // Respond with the created product
//   } catch (error) {
//     console.error('Error creating product:', error); // Log backend error
//     res.status(500).json({ error: 'Failed to create product' });
//   }
// });

// // PUT update product by id (admin only)
// router.put('/:id', authenticateToken, authorizeAdmin, async (req, res) => {
//   try {
//     const { id } = req.params;
//     const data = req.body;

//     const updatedProduct = await prisma.product.update({
//       where: { id },
//       data,
//     });

//     res.json(updatedProduct);
//   } catch (error) {
//     console.error('Error updating product:', error);
//     res.status(500).json({ error: 'Failed to update product' });
//   }
// });

// // DELETE product by id (admin only)
// router.delete('/:id', authenticateToken, authorizeAdmin, async (req, res) => {
//   try {
//     const { id } = req.params;

//     await prisma.product.delete({
//       where: { id },
//     });

//     res.json({ message: 'Product deleted successfully' });
//   } catch (error) {
//     console.error('Error deleting product:', error);
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
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// POST create product (admin only)
router.post('/', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { title, description, price, image, category, rating, inStock } = req.body;

    // Validate required fields
    if (!title || !price || !image || !category) {
      return res.status(400).json({ error: 'Missing required product fields' });
    }

    // Create the product in the database
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

    res.status(201).json(product); // Respond with the created product
  } catch (error) {
    console.error('Error creating product:', error); // Log backend error
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
    console.error('Error updating product:', error);
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
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

export default router;
