import React, { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { storage } from "../appWrite/appwriteConfig.js";
import { ID, Permission, Role } from "appwrite";
import {
  updateUserStart,
  updateUserSuccess,
  updateUserFailure,
  deleteUserFailure,
  deleteUserStart,
  deleteUserSuccess,
} from "../redux/user/userSlice.js";
import { useDispatch } from "react-redux";

export default function Profile() {
  const { currentUser, loading, error } = useSelector((state) => state.user);
  const fileRef = useRef(null);
  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [formData, setFormData] = useState({});
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const dispatch = useDispatch();
  console.log(uploadProgress);

  //console.log(formData);
  //console.log(file);
  //console.log(currentUser);

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
        "67fed0b9001c2550df97",
        fileId,
        file,
        [Permission.read(Role.any()), Permission.update(Role.any())]
      );

      const previewUrl = storage.getFileView(
        "67fed0b9001c2550df97",
        response.$id
      );

      setImageUrl(previewUrl);
      const updatedData = { ...formData, avatar: previewUrl }; // ✅ fix here
      setFormData(updatedData);
      setUploadComplete(true);
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  //console.log(imageUrl);
  console.log(formData);

  const handleChange = (e) => {
    const updatedData = { ...formData, [e.target.id]: e.target.value };
    setFormData(updatedData);
    //console.log(updatedData); // 👈 Logs full object
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(updateUserStart());
      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData), // ✅ fix typo
      });
      const data = await res.json();
      if (data.success === false) {
        dispatch(updateUserFailure(data.message));
        return;
      }
      dispatch(updateUserSuccess(data));
      setUpdateSuccess(true);
    } catch (error) {
      dispatch(updateUserFailure(error.message));
    }
  };

  const handleDeleteUser = async () => {
    dispatch(deleteUserStart());
    try {
      const res = await fetch(`/api/user/delete/${currentUser._id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      if (data.success === false) {
        dispatch(deleteUserFailure(data.message));
        return;
      }
      dispatch(deleteUserSuccess(data));
    } catch (error) {
      dispatch(deleteUserFailure(error.message));
    }
  };

  return (
    <div>
      <div className="max-w-lg mx-auto p-3 ">
        <h1 className="text-3xl font-semibold text-center my-7">Profile</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
            defaultValue={currentUser.username}
            id="username"
            type="text"
            placeholder="username"
            className="border p-3 rounded-lg"
            onChange={handleChange}
          />
          <input
            defaultValue={currentUser.email}
            id="email"
            type="email"
            placeholder="email"
            className="border p-3 rounded-lg"
            onChange={handleChange}
          />
          <input
            id="password"
            type="password"
            placeholder="password"
            className="border p-3 rounded-lg"
            onChange={handleChange}
          />

          <button
            disabled={loading}
            className="bg-slate-800 p-3 text-white uppercase rounded-lg hover:opacity-95 disabled:opacity-80"
          >
            {loading ? "Loading..." : "Update"}
          </button>
        </form>

        <div className="flex justify-between mt-5">
          <span
            onClick={handleDeleteUser}
            className="text-red-800 cursor-pointer"
          >
            Delete account
          </span>
          <span className="text-red-800 cursor-pointer">Sign out</span>
        </div>
        <p className="text-red-700 mt-5">{error ? error : ""}</p>
        <p className="text-green-700 mt-4">
          {updateSuccess ? "user is updated successfully!" : ""}
        </p>
      </div>
    </div>
  );
}
