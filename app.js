const express = require("express")
const cors = require("cors")
const app = express()
const cookieParser = require("cookie-parser");
const userroutes = require("./routers/auth.routes")
const inventoryroutes = require("./routers/inventory.routes");
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));  
app.use("/api/users", userroutes)
app.use("/api/inventory", inventoryroutes)
module.exports = app