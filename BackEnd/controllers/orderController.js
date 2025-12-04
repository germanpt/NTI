const Order = require("./models/Order");
const ErrorResponse = require("./utils/errorResponse");

exports.getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find().populate({
      path: "user",
      select: "name email",
    });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (err) {
    next(err);
  }
};

exports.updateOrderStatus = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return next(
        new ErrorResponse(`Order not found with id of ${req.params.id}`, 404)
      );
    }

    const { status } = req.body;

    if (!status || !["Delivered", "Cancelled", "Refunded"].includes(status)) {
      return next(
        new ErrorResponse(
          "Invalid status. Must be Delivered, Cancelled, or Refunded.",
          400
        )
      );
    }

    order.status = status;

    if (status === "Delivered") order.deliveredAt = new Date();
    if (status === "Cancelled") order.cancelledAt = new Date();
    if (status === "Refunded") order.refundedAt = new Date();

    await order.save();

    res.status(200).json({
      success: true,
      data: order,
      message: `Order status updated to ${status}`,
    });
  } catch (err) {
    next(err);
  }
};
