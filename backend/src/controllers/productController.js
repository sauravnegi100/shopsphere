import Product from "../models/Product.js";

// Create a new product.
const createProduct = async (req, res) => {
  try {
    // Get product data sent by the client from the request body.
    const { name, description, price, category, images, stock } = req.body;

    // Create a new Product document using the Mongoose model.
    // new Product() creates a document instance in memory; it is not saved to MongoDB yet.
    const product = new Product({
      name,
      description,
      price,
      category,
      images,
      stock,
    });

    // Save the new product document to MongoDB.
    // save() is an asynchronous database operation, so we use await.
    const savedProduct = await product.save();

    return res.status(201).json({
      message: "Product created successfully",
      product: savedProduct,
    });
  } catch (error) {
    console.error("Create product error:", error.message);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

// Get products with pagination, search, category filter, and price filter.
const getProducts = async (req, res) => {
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

    // Add a category filter when a category is provided.
    if (category) {
      filter.category = category;
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
    const products = await Product.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(limit);
    // '.skip(skip)' Skips a specified number of documents before returning the results and '.limit(limit)' Limits the number of documents returned by the query.

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
    console.error("Get product error:", error.message);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

// Get a single product by its ID.
const getProductById = async (req, res) => {
  try {
    // Get the product ID from the URL parameter.
    const { id } = req.params;

    // Find the product using the MongoDB document ID.
    const product = await Product.findById(id);

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
    console.error("Get product error: ", error.message);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

// Update an existing product by its ID.
const updateProduct = async (req, res) => {
  try {
    // Get the product ID from the URL parameter.
    const { id } = req.params;

    // Get the updated product data sent by the client.
    const { name, description, price, category, images, stock } = req.body;

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
    console.error("Update product error: ", error.message);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

// Delete a product by its ID.
const deleteProduct = async (req, res) => {
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
    console.error("Delete product error: ", error.message);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

export {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
