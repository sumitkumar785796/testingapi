const { eq, and } = require("drizzle-orm");
const { items } = require("../models/schema");
const { drizzle } = require("drizzle-orm/neon-http");
const { neon } = require("@neondatabase/serverless");
const { dburl } = require("../utils");

const sql = neon(dburl);
const db = drizzle(sql);

// ✅ Add Inventory
exports.addInventoryData = async (req, res) => {
    const user = req.user;
    if (!user) return res.status(401).json({ message: "Unauthorized access" });

    const { name, category, quantity, price, description, status } = req.body;

    try {
        const result = await db.insert(items).values({
            name,
            category,
            quantity,
            price,
            description,
            status,
            userId: user.userId
        });

        return res.status(200).json({ message: "Inventory item added", data: result });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

// ✅ View Inventory (User-specific)
exports.viewInventoryData = async (req, res) => {
    const user = req.user;
    if (!user) return res.status(401).json({ message: "Unauthorized access" });

    try {
        const result = await db.select().from(items).where(eq(items.userId, user.userId));
        return res.status(200).json({ message: "Inventory fetched", data: result });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};
// ✅ View Single Inventory by ID
exports.getSingleInventoryItem = async (req, res) => {
    const user = req.user;
    const { id } = req.params;

    try {
        const result = await db.select().from(items)
            .where(and(eq(items.id, Number(id)), eq(items.userId, user.userId)));

        if (result.length === 0) {
            return res.status(404).json({ message: "Inventory item not found or unauthorized" });
        }

        return res.status(200).json({ message: "Inventory item fetched", data: result[0] });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

// ✅ Update Inventory by ID and Return Updated Data
exports.updateInventoryData = async (req, res) => {
    const user = req.user;
    const { id } = req.params;
    const { name, category, quantity, price, description, status } = req.body;

    try {
        // Update the item
        await db.update(items)
            .set({ name, category, quantity, price, description, status })
            .where(and(eq(items.id, Number(id)), eq(items.userId, user.userId)));

        // Fetch the updated item
        const updatedItem = await db.select().from(items)
            .where(and(eq(items.id, Number(id)), eq(items.userId, user.userId)));

        if (updatedItem.length === 0) {
            return res.status(404).json({ message: "Inventory item not found after update" });
        }

        return res.status(200).json({ message: "Inventory updated", data: updatedItem[0] });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

// ✅ Delete Inventory by ID and Return Deleted Data
exports.deleteInventoryData = async (req, res) => {
    const user = req.user;
    const { id } = req.params;

    try {
        // Fetch the item before deleting
        const itemToDelete = await db.select().from(items)
            .where(and(eq(items.id, Number(id)), eq(items.userId, user.userId)));

        if (itemToDelete.length === 0) {
            return res.status(404).json({ message: "Inventory item not found" });
        }

        // Delete the item
        await db.delete(items)
            .where(and(eq(items.id, Number(id)), eq(items.userId, user.userId)));

        return res.status(200).json({
            message: "Inventory deleted",
            data: itemToDelete[0]
        });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

