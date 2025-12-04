const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const path = require("path");

dotenv.config({ path: "./.env" });

connectDB();

const app = express();

app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const categoryRoutes = require("./routes/categoryRoutes");

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/categories", categoryRoutes);

const errorHandler = require("./middleware/error");
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server running on port ${PORT}`));

process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`);
});
