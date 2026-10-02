import Product from "../models/Product.js";
import Category from "../models/Category.js";
import uploadToCloudinary from "../utils/cloudinaryUpload.js";

// Create a new product.

const createProduct = async (req, res, next) => {
  try {
    const { name, description, price, category, stock } = req.body;

    // Check whether the selected category exists and is active.
    const categoryExists = await Category.findOne({
      _id: category,
      isActive: true,
    });

    if (!categoryExists) {
      return res.status(404).json({
        message: "Category not found or inactive",
      });
    }

    // Upload received images to Cloudinary.
    const uploadedImages = req.files?.length
      ? await Promise.all(
          req.files.map((file) => uploadToCloudinary(file.buffer)),
        )
      : [];

    // Store Cloudinary secure URLs in the product document.
    const images = uploadedImages.map((image) => image.secure_url);

    const product = new Product({
      name,
      description,
      price,
      category,
      images,
      stock,
    });

    const savedProduct = await product.save();

    return res.status(201).json({
      message: "Product created successfully",
      product: savedProduct,
    });
  } catch (error) {
    next(error);
  }
};

// Get products with pagination, search, category filter, and price filter.
const getProducts = async (req, res, next) => {
  try {
    // Get pagination and search values from the query parameters.
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search?.trim();
    const category = req.query.category?.trim();
    const minPrice = Number(req.query.minPrice);
    const maxPrice = Number(req.query.maxPrice);
    const sort = req.query.sort;

    // Start with an empty MongoDB filter.
    const filter = {};

    // Add a name search condition when a search query is provided.
    if (search) {
      filter.name = {
        $regex: search,
        $options: "i",
      };
    }

    // Get the IDs of all active categories.
    const activeCategories = await Category.find({
      isActive: true,
    }).select("_id");

    // Convert the active category documents into an array of ObjectIds.
    const activeCategoryIds = activeCategories.map((category) => category._id);

    // Only include products that belong to an active category.
    filter.category = {
      $in: activeCategoryIds,
    };

    // Apply the requested category filter if a category ID is provided.
    if (category) {
      filter.category = {
        $in: activeCategoryIds.filter(
          (categoryId) => categoryId.toString() === category,
        ),
      };
    }

    // Add a minimum price condition when a valid minimum price is provided.
    // Number.isNaN() checks whether a value is the special numeric value NaN.
    if (!Number.isNaN(minPrice)) {
      filter.price = {
        $gte: minPrice,
      };
    }

    // Add a maximum price condition when a valid maximum price is provided.
    if (!Number.isNaN(maxPrice)) {
      filter.price = {
        ...filter.price,
        $lte: maxPrice,
      };
    }

    // Determine the sorting order based on the sort query parameter.
    let sortOption = {};

    if (sort === "price_asc") {
      sortOption = { price: 1 };
    }

    if (sort === "price_desc") {
      sortOption = { price: -1 };
    }

    if (sort === "newest") {
      sortOption = { createdAt: -1 };
    }

    if (sort === "oldest") {
      sortOption = { createdAt: 1 };
    }

    // Calculate how many products should be skipped before fetching the current page.
    const skip = (page - 1) * limit;

    // Fetch products that match the filter for the current page.
    // Populate the category reference with the related category document.
    const products = await Product.find(filter)
      .populate("category")
      .sort(sortOption)
      .skip(skip)
      .limit(limit);

    // .populate("category"): Use the ObjectId to find the related Category document.
    // .skip(skip) skips documents before the current page.
    // .limit(limit) limits the number of documents returned.

    // Count only the products that match the filter.
    const totalProducts = await Product.countDocuments(filter);

    // Calculate the total number of pages.
    const totalPages = Math.ceil(totalProducts / limit);

    return res.status(200).json({
      products,
      currentPage: page,
      totalPages,
      totalProducts,
    });
  } catch (error) {
    next(error);
  }
};

// Get a single product by its ID.
const getProductById = async (req, res, next) => {
  try {
    // Get the product ID from the URL parameter.
    const { id } = req.params;

    // Populate the category reference with the related category document.
    const product = await Product.findById(id).populate("category");

    // Stop the request if no product exists with the provided ID.
    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    return res.status(200).json({
      product,
    });
  } catch (error) {
    next(error);
  }
};

// Update an existing product by its ID.
const updateProduct = async (req, res, next) => {
  try {
    // Get the product ID from the URL parameter.
    const { id } = req.params;

    // Get the updated product data sent by the client.
    const { name, description, price, category, images, stock } = req.body;

    // Check whether the selected category exists and is active.
    const categoryExists = await Category.findOne({
      _id: category,
      isActive: true,
    });

    // Stop the request if the category does not exist or is inactive.
    if (!categoryExists) {
      return res.status(404).json({
        message: "Category not found or inactive",
      });
    }

    // Find the product by ID and update the provided fields.
    // Flow: Product.findByIdAndUpdate(id, updateData, options)
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        name,
        description,
        price,
        category,
        images,
        stock,
      },
      {
        new: true, // Return the updated document after the update.
        runValidators: true, // Ensure that Mongoose schema validations run during the update.
      },
    );

    // Stop the request if no product exists with the provided ID.
    if (!updatedProduct) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    return res.status(200).json({
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    next(error);
  }
};

// Delete a product by its ID.
const deleteProduct = async (req, res, next) => {
  try {
    // Get the product ID from the URL parameter.
    const { id } = req.params;

    // Find the product by its ID and permanently remove it from the database.
    const deletedProduct = await Product.findByIdAndDelete(id);

    // Stop the request if no product exists with the provided ID.
    if (!deletedProduct) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    return res.status(200).json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
