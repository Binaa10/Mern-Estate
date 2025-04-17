import React, { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { storage } from "../appWrite/appwriteConfig.js";
import { ID, Permission, Role } from "appwrite";

export default function Profile() {
  const { currentUser } = useSelector((state) => state.user);
  const fileRef = useRef(null);
  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadComplete, setUploadComplete] = useState(false);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setUploadProgress(0);
      setUploadComplete(false);
    }
  };

  useEffect(() => {
    if (file) {
      handleFileUpload(file);
    }
  }, [file]);

  const handleFileUpload = async (file) => {
    try {
      const fileId = ID.unique();

      const response = await storage.createFile(
        "67fed0b9001c2550df97", // bucket ID
        fileId,
        file,
        [
          Permission.read(Role.any()), // Public access for now
          Permission.update(Role.any()),
        ]
      );

      // Show uploaded image
      const previewUrl = storage.getFileView(
        "67fed0b9001c2550df97",
        response.$id
      );
      setImageUrl(previewUrl);
      setUploadComplete(true);
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  console.log(imageUrl);

  return (
    <div>
      <div className="max-w-lg mx-auto p-3 ">
        <h1 className="text-3xl font-semibold text-center my-7">Profile</h1>

        <form className="flex flex-col gap-4">
          <input
            onChange={handleFileChange}
            type="file"
            ref={fileRef}
            hidden
            accept="image/*"
          />

          <img
            onClick={() => fileRef.current.click()}
            className="rounded-full h-24 w-24 self-center object-cover cursor-pointer mt-2"
            src={
              imageUrl ||
              currentUser?.avatar ||
              "https://via.placeholder.com/150?text=Profile"
            }
            alt="profile"
          />

          {/* Upload progress display */}
          {file && (
            <p className="text-sm text-center mt-1 ">
              {uploadComplete ? (
                <span className="text-green-600 font-semibold">
                  Image uploaded successfully!{" "}
                </span>
              ) : (
                <span className="text-slate-700 ">Uploading...</span>
              )}
            </p>
          )}

          <input
            id="username"
            type="text"
            placeholder="username"
            className="border p-3 rounded-lg"
          />
          <input
            id="email"
            type="email"
            placeholder="email"
            className="border p-3 rounded-lg"
          />
          <input
            id="password"
            type="password"
            placeholder="password"
            className="border p-3 rounded-lg"
          />

          <button className="bg-slate-800 p-3 text-white uppercase rounded-lg hover:opacity-95 disabled:opacity-80">
            Update
          </button>
        </form>

        <div className="flex justify-between mt-5">
          <span className="text-red-800 cursor-pointer">Delete account</span>
          <span className="text-red-800 cursor-pointer">Sign out</span>
        </div>
      </div>
    </div>
  );
}
