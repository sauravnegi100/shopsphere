import Product from "../models/Product.js";
import Category from "../models/Category.js";
import uploadToCloudinary from "../utils/cloudinaryUpload.js";
import { deleteFromCloudinary } from "../utils/cloudinaryDelete.js";

// Create a new product.
const createProduct = async (req, res, next) => {
  // Track uploaded images so they can be deleted if product creation fails.
  const uploadedImages = [];

  try {
    const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
    const description =
      typeof req.body.description === "string"
        ? req.body.description.trim()
        : "";
    const category = req.body.category;
    const price = Number(req.body.price);

    // If stock is omitted, use the model's default value of 0.
    const stock = req.body.stock === undefined ? 0 : Number(req.body.stock);

    // Validate required text fields.
    if (!name || !description || !category) {
      return res.status(400).json({
        message: "Name, description, and category are required",
      });
    }

    // Validate price: it must be a positive number.
    if (!Number.isFinite(price) || price <= 0) {
      return res.status(400).json({
        message: "Price must be a number greater than 0",
      });
    }

    // Validate stock: it must be a whole number, zero or greater.
    if (!Number.isInteger(stock) || stock < 0) {
      return res.status(400).json({
        message: "Stock must be a non-negative whole number",
      });
    }

    // Validate category ID format (MongoDB ObjectId).
    if (typeof category !== "string" || !/^[a-f\d]{24}$/i.test(category)) {
      return res.status(400).json({
        message: "Invalid category ID",
      });
    }

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

    // Upload received images to Cloudinary one by one.
    if (req.files?.length) {
      for (const file of req.files) {
        const uploadedImage = await uploadToCloudinary(file.buffer);
        uploadedImages.push(uploadedImage);
      }
    }

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
    // Clean up any images uploaded before the creation failed.
    if (uploadedImages.length > 0) {
      const cleanupResults = await Promise.allSettled(
        uploadedImages.map((image) => deleteFromCloudinary(image.secure_url)),
      );

      cleanupResults.forEach((result) => {
        if (result.status === "rejected") {
          console.error(
            "Failed to clean up a newly uploaded Cloudinary image:",
            result.reason,
          );
        }
      });
    }

    next(error);
  }
};

// Get products with pagination, search, category filter, and price filter.
const getProducts = async (req, res, next) => {
  try {
    // Get query parameters.
    const {
      page: pageQuery,
      limit: limitQuery,
      search: searchQuery,
      category: categoryQuery,
      minPrice: minPriceQuery,
      maxPrice: maxPriceQuery,
      sort,
    } = req.query;

    // Validate pagination input types and empty values.
    if (
      (pageQuery !== undefined &&
        (typeof pageQuery !== "string" || !pageQuery.trim())) ||
      (limitQuery !== undefined &&
        (typeof limitQuery !== "string" || !limitQuery.trim()))
    ) {
      return res.status(400).json({
        message: "Page and limit must be valid positive integers",
      });
    }

    const page = pageQuery === undefined ? 1 : Number(pageQuery);
    const limit = limitQuery === undefined ? 10 : Number(limitQuery);

    // Validate page and limit.
    if (!Number.isInteger(page) || page < 1) {
      return res.status(400).json({
        message: "Page must be a positive integer",
      });
    }

    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
      return res.status(400).json({
        message: "Limit must be an integer between 1 and 100",
      });
    }

    // Validate search.
    if (searchQuery !== undefined && typeof searchQuery !== "string") {
      return res.status(400).json({
        message: "Search must be a string",
      });
    }

    const search = searchQuery?.trim();

    // Limit search query length.
    if (search && search.length > 100) {
      return res.status(400).json({
        message: "Search query cannot exceed 100 characters",
      });
    }

    // Validate category ID if provided.
    if (
      categoryQuery !== undefined &&
      (typeof categoryQuery !== "string" ||
        !/^[a-f\d]{24}$/i.test(categoryQuery.trim()))
    ) {
      return res.status(400).json({
        message: "Invalid category ID",
      });
    }

    const category = categoryQuery?.trim();

    // Validate minimum price if provided.
    if (
      minPriceQuery !== undefined &&
      (typeof minPriceQuery !== "string" ||
        !minPriceQuery.trim() ||
        !Number.isFinite(Number(minPriceQuery)) ||
        Number(minPriceQuery) < 0)
    ) {
      return res.status(400).json({
        message: "minPrice must be a non-negative number",
      });
    }

    // Validate maximum price if provided.
    if (
      maxPriceQuery !== undefined &&
      (typeof maxPriceQuery !== "string" ||
        !maxPriceQuery.trim() ||
        !Number.isFinite(Number(maxPriceQuery)) ||
        Number(maxPriceQuery) < 0)
    ) {
      return res.status(400).json({
        message: "maxPrice must be a non-negative number",
      });
    }

    const minPrice = minPriceQuery === undefined ? NaN : Number(minPriceQuery);
    const maxPrice = maxPriceQuery === undefined ? NaN : Number(maxPriceQuery);

    // Ensure minimum price does not exceed maximum price.
    if (
      !Number.isNaN(minPrice) &&
      !Number.isNaN(maxPrice) &&
      minPrice > maxPrice
    ) {
      return res.status(400).json({
        message: "minPrice cannot be greater than maxPrice",
      });
    }

    // Validate sorting option.
    const allowedSortOptions = ["price_asc", "price_desc", "newest", "oldest"];

    if (
      sort !== undefined &&
      (typeof sort !== "string" || !allowedSortOptions.includes(sort))
    ) {
      return res.status(400).json({
        message: "Invalid sort option",
      });
    }

    // Start with an empty MongoDB filter.
    const filter = {};

    // Add a name search condition when a search query is provided.
    if (search) {
      // Escape special regex characters so the search is treated as plain text.
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      filter.name = {
        $regex: escapedSearch,
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
  // Keep track of successfully uploaded images for cleanup if needed.
  const uploadedImages = [];

  try {
    const { id } = req.params;

    // Find the existing product first.
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    // Keep the old image URLs before replacing them.
    const previousImages = [...product.images];

    // Prepare only the fields sent in the request.
    const updateData = {};

    const allowedFields = ["name", "description", "price", "category", "stock"];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    // Validate name only if it was provided.
    if (updateData.name !== undefined) {
      if (typeof updateData.name !== "string" || !updateData.name.trim()) {
        return res.status(400).json({
          message: "Name must be a non-empty string",
        });
      }

      updateData.name = updateData.name.trim();
    }

    // Validate description only if it was provided.
    if (updateData.description !== undefined) {
      if (
        typeof updateData.description !== "string" ||
        !updateData.description.trim()
      ) {
        return res.status(400).json({
          message: "Description must be a non-empty string",
        });
      }

      updateData.description = updateData.description.trim();
    }

    // Validate price only if it was provided.
    if (updateData.price !== undefined) {
      const rawPrice = updateData.price;

      if (
        (typeof rawPrice !== "string" && typeof rawPrice !== "number") ||
        String(rawPrice).trim() === ""
      ) {
        return res.status(400).json({
          message: "Price must be a number greater than 0",
        });
      }

      const price = Number(rawPrice);

      if (!Number.isFinite(price) || price <= 0) {
        return res.status(400).json({
          message: "Price must be a number greater than 0",
        });
      }

      updateData.price = price;
    }

    // Validate stock only if it was provided.
    if (updateData.stock !== undefined) {
      const rawStock = updateData.stock;

      if (
        (typeof rawStock !== "string" && typeof rawStock !== "number") ||
        String(rawStock).trim() === ""
      ) {
        return res.status(400).json({
          message: "Stock must be a non-negative whole number",
        });
      }

      const stock = Number(rawStock);

      if (!Number.isInteger(stock) || stock < 0) {
        return res.status(400).json({
          message: "Stock must be a non-negative whole number",
        });
      }

      updateData.stock = stock;
    }

    // Validate category only if it was provided.
    if (updateData.category !== undefined) {
      if (
        typeof updateData.category !== "string" ||
        !/^[a-f\d]{24}$/i.test(updateData.category)
      ) {
        return res.status(400).json({
          message: "Invalid category ID",
        });
      }

      const categoryExists = await Category.findOne({
        _id: updateData.category,
        isActive: true,
      });

      if (!categoryExists) {
        return res.status(404).json({
          message: "Category not found or inactive",
        });
      }
    }

    // Upload new images one by one so successful uploads are tracked.
    if (req.files?.length) {
      for (const file of req.files) {
        const uploadedImage = await uploadToCloudinary(file.buffer);
        uploadedImages.push(uploadedImage);
      }

      // Replace old image URLs with the newly uploaded URLs.
      updateData.images = uploadedImages.map((image) => image.secure_url);
    }

    // Apply the updates to the existing product.
    Object.assign(product, updateData);

    // Save the updated product in MongoDB.
    const updatedProduct = await product.save();

    // Delete old images only after the database save succeeds.
    if (req.files?.length) {
      const deletionResults = await Promise.allSettled(
        previousImages.map((imageUrl) => deleteFromCloudinary(imageUrl)),
      );

      deletionResults.forEach((result) => {
        if (result.status === "rejected") {
          console.error(
            "Failed to delete an old Cloudinary image:",
            result.reason,
          );
        }
      });
    }

    return res.status(200).json({
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    // If updating fails, remove any new images already uploaded.
    if (uploadedImages.length > 0) {
      const cleanupResults = await Promise.allSettled(
        uploadedImages.map((image) => deleteFromCloudinary(image.secure_url)),
      );

      cleanupResults.forEach((result) => {
        if (result.status === "rejected") {
          console.error(
            "Failed to clean up a newly uploaded Cloudinary image:",
            result.reason,
          );
        }
      });
    }

    next(error);
  }
};

// Delete a product and its Cloudinary images.
const deleteProduct = async (req, res, next) => {
  try {
    // Get the product ID from the URL parameter.
    const { id } = req.params;

    // Find the product before deleting it.
    const product = await Product.findById(id);

    // Stop if no product exists with the provided ID.
    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    // Delete the product from MongoDB first.
    await Product.findByIdAndDelete(id);

    // Delete the product's images from Cloudinary.
    const deletionResults = await Promise.allSettled(
      product.images.map((imageUrl) => deleteFromCloudinary(imageUrl)),
    );

    // Log any image deletion failures for later investigation.
    deletionResults.forEach((result) => {
      if (result.status === "rejected") {
        console.error("Failed to delete a Cloudinary image:", result.reason);
      }
    });

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
