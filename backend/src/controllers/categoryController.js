import Category from "../models/Category.js";

// Create a new category.
const createCategory = async (req, res) => {
  try {
    // Get category details from the request body.
    const { name, slug, description } = req.body;

    // Check whether the required category fields are provided.
    if (!name || !slug) {
      return res.status(400).json({
        message: "Name and slug are required",
      });
    }

    // Check whether a category with the same name or slug already exists.
    const existingCategory = await Category.findOne({
      $or: [{ name }, { slug }],
      // $or is a MongoDB query operator that matches documents when at least one of the specified conditions is true.
    });

    if (existingCategory) {
      return res.status(409).json({
        message: "Category with this name or slug already exists",
        // 409 Conflict means the request conflicts with the current state of the resource.
      });
    }

    // Create and save the new category in MongoDB.
    // Model.create() creates a new document and saves it to MongoDB.
    const category = await Category.create({
      name,
      slug,
      description,
    });

    return res.status(201).json({
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    console.error("Create category error: ", error.message);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

// Get all active categories.
const getCategories = async (req, res) => {
  try {
    // Find all active categories and sort them alphabetically by name.
    const categories = await Category.find({ isActive: true }).sort({
      name: 1,
    });
    // { isActive: true }: Only return categories whose isActive field is true.
    // .sort({name: 1}): Sort categories by name in ascending/alphabetical order.

    return res.status(200).json({
      categories,
    });
  } catch (error) {
    console.error("Get categories error: ", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// Get a category by its ID.
const getCategoryById = async (req, res) => {
  try {
    // Find the category using the ID provided in the URL parameter.
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    return res.status(200).json({
      category,
    });
  } catch (error) {
    console.error("Get category error: ", error.message);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

// Update a category by its ID.
const updateCategory = async (req, res) => {
  try {
    // Update the category using the ID provided in the URL parameter.
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // Return the updated document after the update.
      runValidators: true, // Ensures that schema validations run during the update.
    });

    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    return res.status(200).json({
      message: "Category updated successfully",
      category,
    });
  } catch (error) {
    console.error("Update category error:", error.message);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

// Deactivate a category by its ID instead of permanently deleting it.
const deleteCategory = async (req, res) => {
  try {
    // Set the category as inactive using the ID provided in the URL parameter.
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }, // Return the updated document after the update.
    );

    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    return res.status(200).json({
      message: "Category deactivated successfully",
      category,
    });
  } catch (error) {
    console.error("Delete category error: ", error.message);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

export { createCategory, getCategories, getCategoryById, updateCategory, deleteCategory };
