import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { db } from "./src/db/index.ts";
import { categories, products, orders, order_items, customers, banners } from "./src/db/schema.ts";
import { requireAuth, requireAdmin, AuthRequest } from "./src/middleware/auth.ts";
import { eq, desc } from "drizzle-orm";

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // === Admin API Routes ===
  app.get("/api/admin/orders", requireAdmin, async (req: express.Request, res: express.Response) => {
    try {
      const data = await db.query.orders.findMany({
        orderBy: [desc(orders.created_at)],
        with: {
          items: {
            with: { product: true },
          },
        },
      });
      res.json(data);
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch all orders for admin" });
    }
  });

  app.patch("/api/admin/orders/:id/status", requireAdmin, async (req: express.Request, res: express.Response) => {
    try {
      const { status } = req.body;
      const [updated] = await db.update(orders)
        .set({ status })
        .where(eq(orders.id, Number(req.params.id)))
        .returning();
      res.json(updated);
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: "Failed to update order status" });
    }
  });

  app.post("/api/admin/categories", requireAdmin, async (req: express.Request, res: express.Response) => {
    try {
      const { name, icon_url, display_order } = req.body;
      const [newCategory] = await db.insert(categories).values({
        name,
        icon_url,
        display_order
      }).returning();
      res.json(newCategory);
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: "Failed to add category" });
    }
  });

  app.post("/api/admin/products", requireAdmin, async (req: express.Request, res: express.Response) => {
    try {
      const { name, description, price, image_url, weight, stock, categoryId } = req.body;
      const [newProduct] = await db.insert(products).values({
        name,
        description,
        price: Number(price),
        image_url,
        unit: weight || '1 item',
        in_stock: Number(stock) > 0,
        categoryId: Number(categoryId)
      }).returning();
      res.json(newProduct);
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: "Failed to add product" });
    }
  });

  app.post("/api/admin/banners", requireAdmin, async (req: express.Request, res: express.Response) => {
    try {
      const { image_url, display_order } = req.body;
      const [newBanner] = await db.insert(banners).values({
        image_url,
        display_order
      }).returning();
      res.json(newBanner);
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: "Failed to add banner" });
    }
  });

  app.delete("/api/admin/banners/:id", requireAdmin, async (req: express.Request, res: express.Response) => {
    try {
      await db.delete(banners).where(eq(banners.id, Number(req.params.id)));
      res.json({ success: true });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: "Failed to delete banner" });
    }
  });

  app.delete("/api/admin/products/:id", requireAdmin, async (req: express.Request, res: express.Response) => {
    try {
      await db.delete(products).where(eq(products.id, Number(req.params.id)));
      res.json({ success: true });
    } catch (err: any) {
      console.error(err);
      if (err.code === '23503') {
        res.status(400).json({ error: "Cannot delete product because it has been ordered by customers." });
      } else {
        res.status(500).json({ error: "Failed to delete product" });
      }
    }
  });

  // === Public API Routes ===

  app.get("/api/banners", async (req, res) => {
    try {
      const data = await db.select().from(banners).where(eq(banners.is_active, true)).orderBy(banners.display_order);
      res.json(data);
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch banners" });
    }
  });

  app.get("/api/categories", async (req, res) => {
    try {
      const data = await db.select().from(categories).orderBy(categories.display_order);
      res.json(data);
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  app.get("/api/products", async (req, res) => {
    try {
      const { category_id } = req.query;
      let data;
      if (category_id) {
        data = await db.select().from(products).where(eq(products.categoryId, Number(category_id)));
      } else {
        data = await db.select().from(products);
      }
      res.json(data);
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  app.get("/api/profile", requireAuth, async (req: express.Request, res: express.Response) => {
    try {
      const [user] = await db.select().from(customers).where(eq(customers.uid, (req as AuthRequest).user!.uid));
      res.json(user);
    } catch (err: any) {
      res.status(500).json({ error: "Failed to fetch profile" });
    }
  });

  app.patch("/api/profile", requireAuth, async (req: express.Request, res: express.Response) => {
    try {
      const { name, phone, address, addresses } = req.body;
      const [updated] = await db.update(customers)
        .set({ name, phone, address, addresses })
        .where(eq(customers.uid, (req as AuthRequest).user!.uid))
        .returning();
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: "Failed to update profile" });
    }
  });

  app.post("/api/orders", requireAuth, async (req: express.Request, res: express.Response) => {
    try {
      const { customer_name, phone_number, address, delivery_slot, items, latitude, longitude } = req.body;
      
      if (!items || items.length === 0) {
        return res.status(400).json({ error: "Order must have items" });
      }

      let total = 0;
      for (const item of items) {
        total += item.price_at_order * item.quantity;
      }

      const [newOrder] = await db.insert(orders).values({
        userId: (req as AuthRequest).user!.uid,
        customer_name,
        phone_number,
        address,
        latitude,
        longitude,
        delivery_slot,
        total_amount: total,
      }).returning();

      const orderItemsToInsert = items.map((item: any) => ({
        orderId: newOrder.id,
        productId: item.productId,
        quantity: item.quantity,
        price_at_order: item.price_at_order,
      }));

      await db.insert(order_items).values(orderItemsToInsert);

      res.status(201).json(newOrder);
    } catch (err: any) {
      console.error("Order error", err);
      res.status(500).json({ error: "Failed to place order" });
    }
  });

  app.get("/api/orders/history", requireAuth, async (req: express.Request, res: express.Response) => {
    try {
      const data = await db.query.orders.findMany({
        where: eq(orders.userId, (req as AuthRequest).user!.uid),
        orderBy: [desc(orders.created_at)],
        with: {
          items: {
            with: {
              product: true,
            },
          },
        },
      });
      res.json(data);
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch order history" });
    }
  });
  
  app.get("/api/orders/:id", requireAuth, async (req: express.Request, res: express.Response) => {
    try {
      const order = await db.query.orders.findFirst({
        where: eq(orders.id, Number(req.params.id)),
        with: {
          items: {
            with: {
              product: true,
            },
          },
        },
      });
      if (!order || order.userId !== (req as AuthRequest).user!.uid) return res.status(404).json({ error: "Not found" });
      res.json(order);
    } catch (err: any) {
      res.status(500).json({ error: "Failed to fetch order details" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
