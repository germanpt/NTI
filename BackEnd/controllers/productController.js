const Product = require("../models/Product");
const ErrorResponse = require("../utils/errorResponse");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../uploads/product_images");

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(
      null,
      `${req.params.id}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new ErrorResponse("Only image files are allowed!", 400), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 1024 * 1024 * 5 },
}).single("imageFile");

const uploadPromise = (req, res) => {
  return new Promise((resolve, reject) => {
    upload(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        return reject(new ErrorResponse(`Multer Error: ${err.message}`, 400));
      } else if (err) {
        if (err.statusCode) return reject(err);
        return reject(
          new ErrorResponse(`Unknown Upload Error: ${err.message}`, 500)
        );
      }
      resolve();
    });
  });
};

exports.getProducts = async (req, res, next) => {
  try {
    const products = await Product.find().notDeleted().populate("category");

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (err) {
    next(err);
  }
};

exports.getProductBySlug = async (req, res, next) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug })
      .notDeleted()
      .populate("category");

    if (!product) {
      return next(
        new ErrorResponse(`Product not found with slug ${req.params.slug}`, 404)
      );
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (err) {
    next(err);
  }
};

exports.createProduct = async (req, res, next) => {
  try {
    req.body.user = req.user.id;

    const product = await Product.create(req.body);

    res.status(201).json({
      success: true,
      data: product,
    });
  } catch (err) {
    next(err);
  }
};

exports.softDeleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return next(
        new ErrorResponse(`Product not found with id of ${req.params.id}`, 404)
      );
    }

    await product.softDelete();

    res.status(200).json({
      success: true,
      data: {},
      message: "Product successfully soft-deleted",
    });
  } catch (err) {
    next(err);
  }
};

exports.updateStock = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { size, quantityChange } = req.body;

    if (!size || quantityChange === undefined) {
      return next(
        new ErrorResponse("Please provide the size and quantityChange", 400)
      );
    }

    const product = await Product.findById(id);

    if (!product) {
      return next(new ErrorResponse(`Product not found with id of ${id}`, 404));
    }

    await product.updateStock(size, quantityChange);

    res.status(200).json({
      success: true,
      data: product.sizes,
      message: `Stock for size ${size} updated successfully`,
    });
  } catch (err) {
    next(new ErrorResponse(err.message, 400));
  }
};

exports.uploadProductImages = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return next(
        new ErrorResponse(`Product not found with id ${req.params.id}`, 404)
      );
    }

    await uploadPromise(req, res);

    if (!req.file) {
      return next(
        new ErrorResponse("Please select an image file to upload.", 400)
      );
    }

    const imageUrl = `/uploads/product_images/${req.file.filename}`;

    product.images.push({
      url: imageUrl,

      publicId: req.file.filename,
    });

    await product.save();

    res.status(200).json({
      success: true,
      data: product.images,
      message: `File uploaded and image URL saved to product. Accessible at ${imageUrl}`,
    });
  } catch (err) {
    next(err);
  }
};
