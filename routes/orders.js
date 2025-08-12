// // routes/order.js
// import express from "express";
// import { PrismaClient, OrderStatus } from "@prisma/client";
// import { authenticateToken, authorizeAdmin } from "../middleware/auth.js";

// const router = express.Router();
// const prisma = new PrismaClient();

// // Helper: map DB enum -> lowercase string for frontend
// const toClientStatus = (s) =>
//   (s || "").toString().toLowerCase(); // PENDING -> "pending"

// // Helper: map lowercase -> DB enum
// const toDbStatus = (s) => {
//   const up = (s || "").toString().toUpperCase();
//   if (!Object.keys(OrderStatus).includes(up)) {
//     throw new Error("Invalid status");
//   }
//   return up;
// };

// // Helper: shape order for client
// function toClientOrder(o) {
//   return {
//     id: o.id,
//     date: o.createdAt.toISOString(),
//     status: toClientStatus(o.status),
//     total: Number(o.total),
//     items: o.items.map((it) => ({
//       id: it.id,
//       title: it.product?.title || "",
//       price: Number(it.price),
//       quantity: it.quantity,
//     })),
//     shippingAddress: {
//       name: o.user?.name || o.user?.email || "",
//       address: o.address?.street || "",
//       city: o.address?.city || "",
//       zip: o.address?.zip || "",
//     },
//   };
// }

// // POST /api/orders  (auth) — create order
// router.post("/", authenticateToken, async (req, res) => {
//   try {
//     const userId = req.user.userId;
//     const {
//       items = [], // [{ productId, quantity }]
//       shipping = "standard",
//       payment = "cod",
//       address = {}, // { name, phone, email, street, city, zip, state?, country? }
//     } = req.body || {};

//     if (!Array.isArray(items) || items.length === 0) {
//       return res.status(400).json({ error: "No items in order" });
//     }

//     // Fetch products and compute totals using DB prices (avoid client tampering)
//     const productIds = items.map((i) => i.productId);
//     const products = await prisma.product.findMany({
//       where: { id: { in: productIds } },
//     });
//     const productMap = Object.fromEntries(products.map((p) => [p.id, p]));

//     let total = 0;
//     const preparedItems = items.map((i) => {
//       const p = productMap[i.productId];
//       if (!p) {
//         throw new Error("Invalid product in cart");
//       }
//       const price = Number(p.price);
//       const qty = Number(i.quantity || 0);
//       if (qty <= 0) throw new Error("Invalid quantity");
//       total += price * qty;
//       return { productId: p.id, price, quantity: qty };
//     });

//     // Create (or reuse) a simple address record
//     const addr = await prisma.address.create({
//       data: {
//         userId,
//         street: address.street || address.address || "",
//         city: address.city || "",
//         state: address.state || "",
//         zip: address.zip || "",
//         country: address.country || "",
//         isDefault: false,
//       },
//     });

//     const order = await prisma.order.create({
//       data: {
//         userId,
//         total,
//         status: "PENDING",
//         addressId: addr.id,
//         items: {
//           create: preparedItems.map((i) => ({
//             productId: i.productId,
//             quantity: i.quantity,
//             price: i.price,
//           })),
//         },
//         // You can store shipping/payment fields in a metadata table if needed.
//       },
//       include: {
//         items: { include: { product: true } },
//         address: true,
//         user: true,
//       },
//     });

//     return res.status(201).json(toClientOrder(order));
//   } catch (e) {
//     console.error("Create order error:", e);
//     return res.status(500).json({ error: "Failed to create order" });
//   }
// });

// // GET /api/orders/my  (auth) — user’s orders w/ pagination, sorting, filtering
// router.get("/my", authenticateToken, async (req, res) => {
//   try {
//     const userId = req.user.userId;
//     const page = Math.max(parseInt(req.query.page || "1", 10), 1);
//     const limit = Math.min(Math.max(parseInt(req.query.limit || "10", 10), 1), 50);
//     const sort = (req.query.sort || "date").toString(); // 'date' | 'total'
//     const order = (req.query.order || "desc").toString(); // 'asc' | 'desc'
//     const status = req.query.status ? toDbStatus(req.query.status) : undefined;

//     const where = { userId, ...(status ? { status } : {}) };
//     const totalCount = await prisma.order.count({ where });
//     const totalPages = Math.max(Math.ceil(totalCount / limit), 1);

//     const list = await prisma.order.findMany({
//       where,
//       orderBy:
//         sort === "total"
//           ? { total: order === "asc" ? "asc" : "desc" }
//           : { createdAt: order === "asc" ? "asc" : "desc" },
//       skip: (page - 1) * limit,
//       take: limit,
//       include: {
//         items: { include: { product: true } },
//         address: true,
//         user: true,
//       },
//     });

//     const orders = list.map(toClientOrder);

//     return res.json({
//       orders,
//       pagination: { total: totalCount, totalPages, currentPage: page, limit },
//     });
//   } catch (e) {
//     console.error("List my orders error:", e);
//     return res.status(500).json({ error: "Failed to fetch orders" });
//   }
// });

// // GET /api/orders/:id  (auth) — owner or admin
// router.get("/:id", authenticateToken, async (req, res) => {
//   try {
//     const id = req.params.id;
//     const userId = req.user.userId;
//     const role = (req.user.role || "").toString().toUpperCase();

//     const o = await prisma.order.findUnique({
//       where: { id },
//       include: {
//         items: { include: { product: true } },
//         address: true,
//         user: true,
//       },
//     });
//     if (!o) return res.status(404).json({ error: "Not found" });
//     if (o.userId !== userId && role !== "ADMIN") {
//       return res.status(403).json({ error: "Forbidden" });
//     }
//     return res.json(toClientOrder(o));
//   } catch (e) {
//     console.error("Get order error:", e);
//     return res.status(500).json({ error: "Failed to fetch order" });
//   }
// });

// // GET /api/orders  (admin)
// router.get("/", authenticateToken, authorizeAdmin, async (_req, res) => {
//   try {
//     const rows = await prisma.order.findMany({
//       orderBy: { createdAt: "desc" },
//       include: { user: true },
//     });
//     const data = rows.map((o) => ({
//       id: o.id,
//       customer: o.user?.name || o.user?.email || "",
//       total: Number(o.total),
//       status: toClientStatus(o.status),
//       date: o.createdAt.toISOString().split("T")[0],
//     }));
//     return res.json(data);
//   } catch (e) {
//     console.error("Admin list orders error:", e);
//     return res.status(500).json({ error: "Failed to fetch orders" });
//   }
// });

// // PUT /api/orders/:id/status  (admin)
// router.put("/:id/status", authenticateToken, authorizeAdmin, async (req, res) => {
//   try {
//     const id = req.params.id;
//     const status = toDbStatus(req.body?.status);
//     const updated = await prisma.order.update({
//       where: { id },
//       data: { status },
//     });
//     return res.json({ id: updated.id, status: toClientStatus(updated.status) });
//   } catch (e) {
//     console.error("Update status error:", e);
//     return res.status(400).json({ error: "Invalid status or order id" });
//   }
// });

// export default router;




// routes/order.js
import express from "express";
import { PrismaClient, OrderStatus } from "@prisma/client";
import { authenticateToken, authorizeAdmin } from "../middleware/auth.js";

const router = express.Router();
const prisma = new PrismaClient();

// helpers
const toClientStatus = (s) => (s || "").toString().toLowerCase();
const toDbStatus = (s) => {
  const up = (s || "").toString().toUpperCase();
  if (!Object.keys(OrderStatus).includes(up)) throw new Error("Invalid status");
  return up;
};
function toClientOrder(o) {
  return {
    id: o.id,
    date: o.createdAt.toISOString(),
    status: toClientStatus(o.status),
    total: Number(o.total),
    items: o.items.map((it) => ({
      id: it.id,
      title: it.product?.title || "",
      price: Number(it.price),
      quantity: it.quantity,
    })),
    shippingAddress: {
      name: o.user?.name || o.user?.email || "",
      address: o.address?.street || "",
      city: o.address?.city || "",
      zip: o.address?.zip || "",
    },
  };
}

// POST /api/orders  (auth)
router.post("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { items = [], shipping = "standard", payment = "cod", address = {} } = req.body || {};
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "No items in order" });
    }

    // use DB prices
    const productIds = items.map((i) => i.productId);
    const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
    const productMap = Object.fromEntries(products.map((p) => [p.id, p]));

    let total = 0;
    const preparedItems = items.map((i) => {
      const p = productMap[i.productId];
      if (!p) throw new Error("Invalid product in cart");
      const price = Number(p.price);
      const qty = Number(i.quantity || 0);
      if (qty <= 0) throw new Error("Invalid quantity");
      total += price * qty;
      return { productId: p.id, price, quantity: qty };
    });

    // simple address record
    const addr = await prisma.address.create({
      data: {
        userId,
        street: address.street || address.address || "",
        city: address.city || "",
        state: address.state || "",
        zip: address.zip || "",
        country: address.country || "",
        isDefault: false,
      },
    });

    const order = await prisma.order.create({
      data: {
        userId,
        total,
        status: "PENDING",
        addressId: addr.id,
        items: {
          create: preparedItems.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            price: i.price,
          })),
        },
      },
      include: { items: { include: { product: true } }, address: true, user: true },
    });

    res.status(201).json(toClientOrder(order));
  } catch (e) {
    console.error("Create order error:", e);
    res.status(500).json({ error: "Failed to create order" });
  }
});

// GET /api/orders/my  (auth)
router.get("/my", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || "10", 10), 1), 50);
    const sort = (req.query.sort || "date").toString();
    const order = (req.query.order || "desc").toString();
    const status = req.query.status ? toDbStatus(req.query.status) : undefined;

    const where = { userId, ...(status ? { status } : {}) };
    const totalCount = await prisma.order.count({ where });
    const totalPages = Math.max(Math.ceil(totalCount / limit), 1);

    const list = await prisma.order.findMany({
      where,
      orderBy: sort === "total" ? { total: order === "asc" ? "asc" : "desc" }
                                : { createdAt: order === "asc" ? "asc" : "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: { items: { include: { product: true } }, address: true, user: true },
    });

    res.json({
      orders: list.map(toClientOrder),
      pagination: { total: totalCount, totalPages, currentPage: page, limit },
    });
  } catch (e) {
    console.error("List my orders error:", e);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// GET /api/orders/:id  (auth: owner or admin)
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.user.userId;
    const role = (req.user.role || "").toString().toUpperCase();

    const o = await prisma.order.findUnique({
      where: { id },
      include: { items: { include: { product: true } }, address: true, user: true },
    });
    if (!o) return res.status(404).json({ error: "Not found" });
    if (o.userId !== userId && role !== "ADMIN") return res.status(403).json({ error: "Forbidden" });

    res.json(toClientOrder(o));
  } catch (e) {
    console.error("Get order error:", e);
    res.status(500).json({ error: "Failed to fetch order" });
  }
});

// GET /api/orders  (admin)
router.get("/", authenticateToken, authorizeAdmin, async (_req, res) => {
  try {
    const rows = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: { user: true },
    });
    res.json(
      rows.map((o) => ({
        id: o.id,
        customer: o.user?.name || o.user?.email || "",
        total: Number(o.total),
        status: toClientStatus(o.status),
        date: o.createdAt.toISOString().split("T")[0],
      }))
    );
  } catch (e) {
    console.error("Admin list orders error:", e);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// PUT /api/orders/:id/status  (admin)
router.put("/:id/status", authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    const status = toDbStatus(req.body?.status);
    const updated = await prisma.order.update({ where: { id }, data: { status } });
    res.json({ id: updated.id, status: toClientStatus(updated.status) });
  } catch (e) {
    console.error("Update status error:", e);
    res.status(400).json({ error: "Invalid status or order id" });
  }
});

export default router;
