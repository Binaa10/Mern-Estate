import React, { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { storage } from "../appWrite/appwriteConfig.js";
import { ID, Permission, Role } from "appwrite";
import toast from "react-hot-toast";
import {
  updateUserStart,
  updateUserSuccess,
  updateUserFailure,
  deleteUserFailure,
  deleteUserStart,
  deleteUserSuccess,
  signOutUserFailure,
  signOutUserSuccess,
  signOutUserStart,
} from "../redux/user/userSlice.js";
import { Link } from "react-router-dom";

export default function Profile() {
  const { currentUser, loading, error } = useSelector((state) => state.user);
  const fileRef = useRef(null);
  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [formData, setFormData] = useState({});
  const [showListingsError, setShowlistingsError] = useState(false);
  const [userListings, setUserListings] = useState([]);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loadingListings, setLoadingListings] = useState(false);
  const [showUploadMessage, setShowUploadMessage] = useState(false);
  const [showListings, setShowListings] = useState(false);
  const [noListingsMessage, setNoListingsMessage] = useState(false);
  const [showListingDeleteModal, setShowListingDeleteModal] = useState(false);
  const [listingToDelete, setListingToDelete] = useState(null);

  const dispatch = useDispatch();

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setUploadProgress(0);
      setUploadComplete(false);
      setShowUploadMessage(true); // show upload messages
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
      const updatedData = { ...formData, avatar: previewUrl };
      setFormData(updatedData);
      setUploadComplete(true);
      setTimeout(() => {
        setUploadComplete(false);
        setShowUploadMessage(false);
      }, 2000); // hides after 2 seconds
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  const handleChange = (e) => {
    const updatedData = { ...formData, [e.target.id]: e.target.value };
    setFormData(updatedData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(updateUserStart());
      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success === false) {
        dispatch(updateUserFailure(data.message));
        return;
      }
      dispatch(updateUserSuccess(data));
      toast.success(
        <span className="text-sm font-medium animate-pulse">
          Profile updated successfully!
        </span>
      );
    } catch (error) {
      dispatch(updateUserFailure(error.message));
    }
  };

  const handleDeleteUser = async () => {
    dispatch(deleteUserStart());
    try {
      const res = await fetch(`/api/user/delete/${currentUser._id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.success === false) {
        dispatch(deleteUserFailure(data.message));
        return;
      }
      dispatch(deleteUserSuccess(data));
      toast.success(
        <span className="text-sm font-medium animate-pulse">
          user deleted successfully!
        </span>
      );
    } catch (error) {
      dispatch(deleteUserFailure(error.message));
    }
  };

  const handleSignOut = async () => {
    try {
      dispatch(signOutUserStart());
      const res = await fetch("/api/auth/signout");
      const data = await res.json();

      if (data.success === false) {
        dispatch(signOutUserFailure(data));
        return;
      }
      dispatch(signOutUserSuccess(data));
      toast.success(
        <span className="text-sm font-medium animate-pulse">
          Signed out successfully!
        </span>
      );
    } catch (error) {
      dispatch(signOutUserFailure(error));
    }
  };

  const handleShowListings = async () => {
    if (showListings) {
      setShowListings(false);
      return;
    }

    setLoadingListings(true);
    try {
      setShowlistingsError(false);
      const res = await fetch(`/api/user/listings/${currentUser._id}`);
      const data = await res.json();
      if (data.success === false) {
        setShowlistingsError(true);
        return;
      }

      setUserListings(data);

      if (data.length === 0) {
        setNoListingsMessage(true);
        setShowListings(false); // Keep it false if no listings
        setTimeout(() => setNoListingsMessage(false), 2000);
      } else {
        setShowListings(true); // Only show listings if there are any
      }
    } catch (error) {
      setShowlistingsError(true);
    } finally {
      setLoadingListings(false);
    }
  };

  const handleListingDelete = async (listingId) => {
    try {
      const res = await fetch(`/api/listing/delete/${listingId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success === false) {
        console.log(data.message);
        return;
      }
      setUserListings((prev) => {
        const updatedListings = prev.filter(
          (listing) => listing._id !== listingId
        );
        if (updatedListings.length === 0) {
          setShowListings(false);
          setNoListingsMessage(true);
          setTimeout(() => setNoListingsMessage(false), 2000);
        }
        return updatedListings;
      });

      toast.success(
        <span className="text-sm font-medium animate-pulse">
          listing deleted successfully!
        </span>
      );
    } catch (error) {
      console.log(error.message);
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
            src={imageUrl || currentUser.avatar}
            alt="profile"
          />

          {showUploadMessage && (
            <div className="flex justify-center items-center mt-1">
              {uploadComplete ? (
                <span className="text-green-600 font-semibold text-sm text-center">
                  Image uploaded successfully!
                </span>
              ) : (
                <span className="text-slate-700 flex items-center gap-1 text-sm">
                  Uploading
                  <span className="flex gap-1 ml-1">
                    <span className="w-2 h-2 bg-green-600 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-2 h-2 bg-yellow-600 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-2 h-2 bg-red-600 rounded-full animate-bounce"></span>
                  </span>
                </span>
              )}
            </div>
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
          <Link
            to={"/create-listing"}
            className="bg-green-700 p-3 rounded-lg text-white uppercase text-center hover:opacity-95 "
          >
            create listing
          </Link>
        </form>

        <div className="flex justify-between mt-5">
          {/* Trigger delete modal */}
          <span
            onClick={() => setShowDeleteModal(true)}
            className="text-red-800 cursor-pointer"
          >
            Delete account
          </span>

          <span onClick={handleSignOut} className="text-red-800 cursor-pointer">
            Sign out
          </span>
        </div>
        <p className="text-red-700 mt-5">{error ? error : ""}</p>
        <button
          onClick={handleShowListings}
          disabled={loadingListings}
          className="w-full text-green-700 flex items-center justify-center gap-3 disabled:opacity-50 font-semibold"
        >
          {loadingListings ? (
            <>
              <svg
                className="animate-spin h-8 w-8 text-green-700"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="5"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                ></path>
              </svg>
              Loading...
            </>
          ) : showListings ? (
            "Hide Listings"
          ) : (
            "Show Listings"
          )}
        </button>
        {noListingsMessage && (
          <p className="text-center text-sm text-red-800 mt-2">
            You have no listings.
          </p>
        )}

        <p className="text-red-700 mt-5">
          {showListingsError ? "Error showing listings" : ""}
        </p>

        {showListings && userListings.length > 0 && (
          <div className="flex flex-col gap-4 ">
            <h1 className="text-2xl text-center mt-7 font-semibold">
              Your listings
            </h1>
            {userListings.map((listing) => (
              <div
                className="border rounded-lg p-3 justify-between flex items-center gap-4"
                key={listing._id}
              >
                <Link to={`/listing/${listing._id}`}>
                  <img
                    src={listing.imageUrls[0]}
                    alt="listing cover"
                    className="h-16 w-16 object-contain "
                  />
                </Link>
                <Link
                  className="flex-1 text-slate-700 font-semibold hover:underline truncate"
                  to={`/listing/${listing._id}`}
                >
                  <p>{listing.name}</p>
                </Link>
                <div className="flex flex-col items-center">
                  <button
                    onClick={() => {
                      setListingToDelete(listing._id);
                      setShowListingDeleteModal(true);
                    }}
                    className="uppercase text-red-700"
                  >
                    Delete
                  </button>
                  <Link to={`/update-listing/${listing._id}`}>
                    <button className="uppercase text-green-700">edit</button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
        {showDeleteModal && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-start pt-20"
            onClick={() => setShowDeleteModal(false)}
          >
            <div
              className="bg-white p-6 rounded-xl shadow-lg w-full max-w-sm mx-4"
              onClick={(e) => e.stopPropagation()} // Prevent click inside from closing
            >
              <h2 className="text-xl font-bold mb-4 text-red-700">
                Delete Account
              </h2>
              <p className="mb-6 text-gray-700">
                Are you sure you want to delete your account? This action cannot
                be undone.
              </p>
              <div className="flex justify-end gap-4">
                <button
                  className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 text-black"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white"
                  onClick={() => {
                    setShowDeleteModal(false);
                    handleDeleteUser();
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
        {showListingDeleteModal && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-start pt-20"
            onClick={() => setShowListingDeleteModal(false)}
          >
            <div
              className="bg-white p-6 rounded-xl shadow-lg w-full max-w-sm mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold mb-4 text-red-700">
                Delete Listing
              </h2>
              <p className="mb-6 text-gray-700">
                Are you sure you want to delete this listing? This action cannot
                be undone.
              </p>
              <div className="flex justify-end gap-4">
                <button
                  className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 text-black"
                  onClick={() => setShowListingDeleteModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white"
                  onClick={() => {
                    handleListingDelete(listingToDelete);
                    setShowListingDeleteModal(false);
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
