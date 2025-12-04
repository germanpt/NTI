const express = require("express");
const {
  getProducts,
  getProductBySlug,
  createProduct,
  softDeleteProduct,
  updateStock,
  uploadProductImages,
} = require("../controllers/productController");

const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.get("/", getProducts);
router.get("/:slug", getProductBySlug);

router.post("/", protect, authorize("admin"), createProduct);
router.delete("/:id", protect, authorize("admin"), softDeleteProduct);
router.put("/stock/:id", protect, authorize("admin"), updateStock);
router.post("/:id/images", protect, authorize("admin"), uploadProductImages);

module.exports = router;
