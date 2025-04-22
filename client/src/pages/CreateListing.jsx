import React, { useState } from "react";
import { storage } from "../appWrite/appwriteConfig.js";
import { ID, Permission, Role } from "appwrite";

export default function CreateListing() {
  const [files, setFiles] = useState([]);
  const [formData, setFormData] = useState({
    imageUrls: [],
  });
  console.log(formData);
  const [imageUploadError, setImageUploadError] = useState("");
  const [uploading, setUploading] = useState(false);

  const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
  const MAX_FILE_COUNT = 6;

  const handleImageSubmit = async (e) => {
    e.preventDefault();

    const totalImages = formData.imageUrls.length + files.length;

    // Check total image count after adding new ones
    if (totalImages > MAX_FILE_COUNT) {
      setImageUploadError(
        `You can only upload up to ${MAX_FILE_COUNT} images total. You already have ${formData.imageUrls.length}.`
      );
      setUploading(false);
      return;
    }

    // Check individual file size
    for (let file of files) {
      if (file.size > MAX_FILE_SIZE) {
        setImageUploadError("Each file must be less than 2MB.");
        setUploading(false);
        return;
      }
    }

    setUploading(true);
    setImageUploadError(""); // Clear any previous errors

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const fileId = ID.unique();

        const response = await storage.createFile(
          "67fed0b9001c2550df97",
          fileId,
          file,
          [Permission.read(Role.any()), Permission.update(Role.any())]
        );

        const previewUrl = storage.getFileView(
          "67fed0b9001c2550df97",
          response.$id
        );

        return previewUrl;
      });

      const newImageUrls = await Promise.all(uploadPromises);

      setFormData((prev) => ({
        ...prev,
        imageUrls: [...prev.imageUrls, ...newImageUrls],
      }));
      setUploading(false);
      setFiles([]); // Clear selected files
    } catch (error) {
      console.error("Upload failed:", error);
      setImageUploadError("Image upload failed. Please try again.");
      setUploading(false);
    }
  };

  const handleRemoveImage = (index) => {
    setFormData({
      ...formData,
      imageUrls: formData.imageUrls.filter((_, i) => i !== index),
    });
  };

  return (
    <main className="p-3 max-w-4xl mx-auto">
      <h1 className="text-3xl font-semibold text-center my-7">
        Create a Listing
      </h1>
      <form className="flex flex-col sm:flex-row gap-4">
        <div className="flex flex-col gap-4 flex-1">
          <input
            type="text"
            id="name"
            placeholder="Name"
            className="border p-3 rounded-lg"
            maxLength="62"
            minLength="10"
            required
          />
          <textarea
            type="text"
            id="description"
            placeholder="Description"
            className="border p-3 rounded-lg"
            required
          />
          <input
            type="text"
            id="address"
            placeholder="Address"
            className="border p-3 rounded-lg"
            required
          />
          <div className="flex gap-6 flex-wrap">
            <div className="flex gap-2">
              <input type="checkbox" id="sale" className="w-5" />
              <span>Sell</span>
            </div>
            <div className="flex gap-2">
              <input type="checkbox" id="rent" className="w-5" />
              <span>Rent</span>
            </div>
            <div className="flex gap-2">
              <input type="checkbox" id="parking" className="w-5" />
              <span>Parking spot</span>
            </div>
            <div className="flex gap-2">
              <input type="checkbox" id="furnished" className="w-5" />
              <span>Furnished</span>
            </div>
            <div className="flex gap-2">
              <input type="checkbox" id="offer" className="w-5" />
              <span>Offer</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <input
                type="number"
                id="bedrooms"
                min="1"
                max="10"
                required
                className="border p-3 border-gray-300 rounded-lg"
              />
              <p>Beds</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                id="bathrooms"
                min="1"
                max="10"
                required
                className="border p-3 border-gray-300 rounded-lg"
              />
              <p>Baths</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                id="regularPrice"
                min="1"
                max="100000"
                required
                className="border p-3 border-gray-300 rounded-lg"
              />
              <div className="flex flex-col items-center">
                <p>Regular price</p>
                <span className="text-xs">($/month)</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                id="discountPrice"
                min="1"
                max="100000"
                required
                className="border p-3 border-gray-300 rounded-lg"
              />
              <div className="flex flex-col items-center">
                <p>Discounted price</p>
                <span className="text-xs">($/month)</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col flex-1 gap-4">
          <p className="font-semibold">
            Images:
            <span className="font-normal text-gray-600 ml-2">
              The first image will be the cover (max 6)
            </span>
          </p>

          <div className="flex gap-4">
            <input
              onChange={(e) => setFiles(e.target.files)}
              className="border-gray-300 border p-3 rounded w-full"
              type="file"
              id="images"
              accept="image/*"
              multiple
            />
            <button
              onClick={handleImageSubmit}
              type="button"
              className="p-3 border border-green-700 rounded text-green-700 uppercase hover:shadow-lg disabled:opacity-80"
            >
              {uploading ? "Uploading" : "upload"}
            </button>
          </div>
          {imageUploadError && (
            <p className="text-red-500 text-sm">{imageUploadError}</p>
          )}
          {formData.imageUrls.length > 0 &&
            formData.imageUrls.map((url, index) => (
              <div
                className="flex justify-between items-center border p-3"
                key={url}
              >
                <img
                  src={url}
                  alt="listing image"
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <button
                  className="text-red-700 p-3 uppercase hover:opacity-75"
                  onClick={() => handleRemoveImage(index)}
                >
                  Delete
                </button>
              </div>
            ))}

          <button className="p-3 rounded-lg bg-gray-700 text-white uppercase hover:opacity-95">
            Create Listing
          </button>
        </div>
      </form>
    </main>
  );
}
