import mongoose from "mongoose";

// Schema : A Mongoose schema defines the structure, data types, and validation rules for MongoDB documents.
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      // required: true :- This field must be provided; otherwise Mongoose validation will fail.
      trim: true,
      // trim: true :- Removes leading and trailing whitespace from the string.
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      // enum Restricts the field to only the specified allowed values.
      default: "user",
    },
  },
  {
    timestamps: true,
    // Automatically adds and maintains createdAt and updatedAt fields.
  },
);

// Create a Mongoose model named "User" using the "userSchema" schema.
const user = mongoose.model("User", userSchema);

export default user;
