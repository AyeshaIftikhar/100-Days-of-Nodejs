const express = require("express");
const router = express.Router();
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/product");
const { protect } = require("../middleware/auth");

router.route("/").get(getProducts).post(createProduct); // to create products using auth: post(protect, createProduct)

router
  .route("/:id")
  .get(getProduct)
  .put(updateProduct) // to update products using auth: put(protect, updateProduct)
  .delete(deleteProduct); // to delete products using auth: delete(protect, deleteProduct)

module.exports = router;