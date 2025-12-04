const Category = require("../models/Category");
const ErrorResponse = require("../utils/errorResponse");

exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (err) {
    next(err);
  }
};

exports.createCategory = async (req, res, next) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json({
      success: true,
      data: category,
    });
  } catch (err) {
    next(err);
  }
};

exports.updateCategory = async (req, res, next) => {
  try {
    let category = await Category.findOne({ slug: req.params.slug });

    if (!category) {
      return next(
        new ErrorResponse(
          `Category not found with slug ${req.params.slug}`,
          404
        )
      );
    }

    category.set(req.body);
    await category.save();

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category) {
      return next(
        new ErrorResponse(`Category not found with id ${req.params.id}`, 404)
      );
    }

    res.status(200).json({
      success: true,
      data: {},
      message: "Category successfully deleted",
    });
  } catch (err) {
    next(err);
  }
};
