const mongoose = require("mongoose");
const slugify = require("slugify");

const sizeSchema = new mongoose.Schema(
  {
    size: { type: String, required: true },
    stock: {
      type: Number,
      default: 0,
      min: [0, "Stock cannot be negative"],
    },
  },
  { _id: false }
);

const imageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: String,
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add product name"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
      index: true,
    },
    slug: {
      type: String,
      unique: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, "Please add product description"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Please add product price"],
      min: [0, "Price cannot be negative"],
    },
    discountPrice: {
      type: Number,
      min: [0, "Discount price cannot be negative"],
      validate: {
        validator: function (value) {
          if (value === null || value === undefined) return true;
          return value < this.price;
        },
        message: "Discount price must be lower than regular price",
      },
      default: null,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },
    sizes: [sizeSchema],
    images: [imageSchema],

    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: Date,

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

productSchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

productSchema.virtual("currentPrice").get(function () {
  if (this.discountPrice && this.discountPrice < this.price) {
    return this.discountPrice;
  }
  return this.price;
});

productSchema.query.notDeleted = function () {
  return this.where({ isDeleted: false });
};

productSchema.methods.softDelete = function () {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.isActive = false;
  return this.save();
};

productSchema.methods.restore = function () {
  this.isDeleted = false;
  this.deletedAt = undefined;
  this.isActive = true;
  return this.save();
};

productSchema.methods.updateStock = function (size, quantityChange) {
  const sizeIndex = this.sizes.findIndex((s) => s.size === size);

  if (sizeIndex === -1) {
    throw new Error(`Size ${size} not found`);
  }

  const newStock = this.sizes[sizeIndex].stock + quantityChange;

  if (newStock < 0) {
    throw new Error("Insufficient stock for this operation");
  }

  this.sizes[sizeIndex].stock = newStock;
  return this.save();
};

module.exports = mongoose.model("Product", productSchema);
