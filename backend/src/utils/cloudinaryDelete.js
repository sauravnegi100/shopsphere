import cloudinary from "../config/cloudinary.js";

// Extract the public_id only from ShopSphere Cloudinary image URLs.
const getCloudinaryPublicId = (imageUrl) => {
  try {
    const url = new URL(imageUrl);

    // Allow only Cloudinary's standard secure image URLs.
    if (url.hostname !== "res.cloudinary.com" || url.protocol !== "https:") {
      return null;
    }

    const pathParts = url.pathname.split("/").filter(Boolean);

    // Confirm that this URL belongs to our configured Cloudinary account.
    if (pathParts[0] !== process.env.CLOUDINARY_CLOUD_NAME) {
      return null;
    }

    // Find the image upload path.
    const uploadIndex = pathParts.indexOf("upload");

    if (uploadIndex === -1 || pathParts[uploadIndex - 1] !== "image") {
      return null;
    }

    const assetParts = pathParts.slice(uploadIndex + 1);

    // Find Cloudinary's version segment, such as v1234567890.
    const versionIndex = assetParts.findIndex((part) => /^v\d+$/.test(part));

    if (versionIndex === -1) {
      return null;
    }

    // Get the asset path after the version.
    const fileParts = assetParts.slice(versionIndex + 1);

    // Only allow images stored in our product folder.
    if (
      fileParts[0] !== "shopsphere" ||
      fileParts[1] !== "products" ||
      fileParts.length < 3
    ) {
      return null;
    }

    // Remove the file extension to get the Cloudinary public_id.
    const fileName = fileParts[fileParts.length - 1];
    fileParts[fileParts.length - 1] = fileName.replace(/\.[^/.]+$/, "");

    return fileParts.map(decodeURIComponent).join("/");
  } catch {
    return null;
  }
};

// Delete an image from Cloudinary using its URL.
const deleteFromCloudinary = async (imageUrl) => {
  const publicId = getCloudinaryPublicId(imageUrl);

  // Skip URLs that are not recognized as our Cloudinary product images.
  if (!publicId) {
    return null;
  }

  return cloudinary.uploader.destroy(publicId, {
    resource_type: "image",
  });
};

export { getCloudinaryPublicId, deleteFromCloudinary };
