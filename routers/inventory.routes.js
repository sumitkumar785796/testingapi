const express = require("express")
const inventoryroutes = express.Router()
const controller = require("../controllers/inventory.controller")
const authmiddleware = require("../middleware/auth.middleware");
inventoryroutes.route("/")
    .post(authmiddleware, controller.addInventoryData)
    .get(authmiddleware, controller.viewInventoryData)
inventoryroutes.route("/:id")
    .put(authmiddleware, controller.updateInventoryData)
    .get(authmiddleware, controller.getSingleInventoryItem)
    .delete(authmiddleware, controller.deleteInventoryData)
module.exports = inventoryroutes