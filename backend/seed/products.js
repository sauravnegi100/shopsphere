import dotenv from "dotenv";
import connectDB from "../src/config/db.js";
import Product from "../src/models/Product.js";
import Category from "../src/models/Category.js";

dotenv.config();

const seedProducts = async () => {
  try {
    // Connect to the ShopSphere MongoDB database.
    await connectDB();

    // Find category documents using their unique slugs.
    const electronicsCategory = await Category.findOne({
      slug: "electronics-gadgets",
    });

    const footwearCategory = await Category.findOne({
      slug: "footwear",
    });

    const clothingCategory = await Category.findOne({
      slug: "clothing",
    });

    const accessoriesCategory = await Category.findOne({
      slug: "accessories",
    });

    const products = [
      {
        name: "Wireless Headphones",
        description:
          "Bluetooth wireless headphones with deep bass and noise isolation.",
        price: 1999,
        category: electronicsCategory._id,
        images: ["headphones.jpg"],
        stock: 25,
      },

      {
        name: "Gaming Mouse",
        description: "Ergonomic wireless gaming mouse with adjustable DPI.",
        price: 1499,
        category: electronicsCategory._id,
        images: ["gaming-mouse.jpg"],
        stock: 40,
      },

      {
        name: "Mechanical Keyboard",
        description: "RGB mechanical keyboard with tactile switches.",
        price: 2999,
        category: electronicsCategory._id,
        images: ["keyboard.jpg"],
        stock: 18,
      },

      {
        name: "Running Shoes",
        description:
          "Lightweight running shoes designed for everyday training.",
        price: 2499,
        category: footwearCategory._id,
        images: ["running-shoes.jpg"],
        stock: 30,
      },

      {
        name: "Casual Sneakers",
        description: "Comfortable everyday sneakers with a modern design.",
        price: 1899,
        category: footwearCategory._id,
        images: ["sneakers.jpg"],
        stock: 22,
      },

      {
        name: "Classic Cotton T-Shirt",
        description: "Regular-fit cotton t-shirt suitable for everyday wear.",
        price: 699,
        category: clothingCategory._id,
        images: ["tshirt.jpg"],
        stock: 60,
      },

      {
        name: "Slim Fit Jeans",
        description: "Stretchable slim-fit denim jeans for casual wear.",
        price: 1599,
        category: clothingCategory._id,
        images: ["jeans.jpg"],
        stock: 35,
      },

      {
        name: "Leather Wallet",
        description: "Compact leather wallet with multiple card slots.",
        price: 899,
        category: accessoriesCategory._id,
        images: ["wallet.jpg"],
        stock: 45,
      },

      {
        name: "Smart Watch",
        description:
          "Smart watch with activity tracking and notification support.",
        price: 3499,
        category: electronicsCategory._id,
        images: ["smart-watch.jpg"],
        stock: 15,
      },

      {
        name: "Travel Backpack",
        description:
          "Spacious water-resistant backpack for travel and daily use.",
        price: 1299,
        category: accessoriesCategory._id,
        images: ["backpack.jpg"],
        stock: 28,
      },
    ];

    // Remove existing products so the seed data does not create duplicates.
    await Product.deleteMany();

    // Insert all sample products into the Product collection.
    await Product.insertMany(products);

    console.log("Products seeded successfully");

    process.exit(0);
  } catch (error) {
    console.error("Product seeding failed: ", error.message);

    process.exit(1);
  }
};

seedProducts();
