const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    size: { type: String },
    priceAtPurchase: { type: Number, required: true },
  },
  { _id: false }
);

const OrderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderItems: [orderItemSchema],
    shippingAddress: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: [
        "Pending",
        "Processing",
        "Shipped",
        "Delivered",
        "Cancelled",
        "Refunded",
      ],
      default: "Pending",
      index: true,
    },
    deliveredAt: Date,
    cancelledAt: Date,
    refundedAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", OrderSchema);
