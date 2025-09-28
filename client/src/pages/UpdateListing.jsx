import React, { useEffect, useState } from "react";
import { storage } from "../appWrite/appwriteConfig.js";
import { ID, Permission, Role } from "appwrite";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import Lottie from "lottie-react";
import animationData from "../assets/CreatingLoading.json";

export default function CreateListing() {
  const navigate = useNavigate();
  const params = useParams();

  const { currentUser } = useSelector((state) => state.user);
  const [files, setFiles] = useState([]);
  const [formData, setFormData] = useState({
    imageUrls: [],
    name: "",
    description: "",
    address: "",
    type: "rent",
    bedrooms: 1,
    bathrooms: 1,
    regularPrice: 50,
    discountPrice: 0,
    offer: false,
    furnished: false,
    parking: false,
  });
  //console.log(formData);
  const [imageUploadError, setImageUploadError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
  const MAX_FILE_COUNT = 6;

  useEffect(() => {
    const fetchListing = async () => {
      const listingId = params.listingId;
      const res = await fetch(`/api/listing/get/${listingId}`);
      const data = await res.json();
      if (data.success === false) {
        console.log(data.message);
        return;
      }
      setFormData(data);
    };
    fetchListing();
  }, []);

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

  const handleChange = (e) => {
    if (e.target.id === "sale" || e.target.id === "rent") {
      setFormData({
        ...formData,
        type: e.target.id,
      });
    }

    if (
      e.target.id === "parking" ||
      e.target.id === "furnished" ||
      e.target.id === "offer"
    ) {
      setFormData({
        ...formData,
        [e.target.id]: e.target.checked,
      });
    }
    if (
      e.target.type === "number" ||
      e.target.type === "text" ||
      e.target.type === "textarea"
    ) {
      setFormData({
        ...formData,
        [e.target.id]: e.target.value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.imageUrls.length < 1)
        return setError("You must upload atleast one image");
      if (+formData.regularPrice < +formData.discountPrice)
        return setError("Discount price must be lower than regualr price");
      setError(false);
      setLoading(true);
      const res = await fetch(`/api/listing/update/${params.listingId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...formData, userRef: currentUser._id }),
      });
      const data = await res.json();
      setLoading(false);
      if (data.success === false) {
        setError(data.message);
      }
      navigate(`/listing/${data._id}`);
      toast.success(
        <span className="text-sm font-medium animate-pulse">
          Listing updated successfully!
        </span>
      );
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen bg-gradient-to-br from-emerald-50 via-white to-slate-100">
      <div className="pointer-events-none absolute -top-10 left-10 h-72 w-72 rounded-full bg-emerald-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 right-10 h-80 w-80 rounded-full bg-emerald-100/60 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-4 py-16">
        <header className="mb-10 text-center">
          <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">
            Update a Listing
          </h1>
        </header>

        <form
          onSubmit={handleSubmit}
          className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]"
        >
          <section className="rounded-3xl border border-emerald-100 bg-white/85 p-6 shadow-xl shadow-emerald-100/60 backdrop-blur-sm sm:p-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <label
                  htmlFor="name"
                  className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-500"
                >
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  placeholder="Name"
                  className="w-full rounded-2xl border border-emerald-100/70 bg-slate-50 px-4 py-3 text-sm text-slate-700 shadow-inner shadow-emerald-50 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                  maxLength="62"
                  minLength="10"
                  required
                  onChange={handleChange}
                  value={formData.name}
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="description"
                  className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-500"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  placeholder="Description"
                  className="h-32 w-full resize-none rounded-2xl border border-emerald-100/70 bg-slate-50 px-4 py-3 text-sm text-slate-700 shadow-inner shadow-emerald-50 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                  required
                  onChange={handleChange}
                  value={formData.description}
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="address"
                  className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-500"
                >
                  Address
                </label>
                <input
                  type="text"
                  id="address"
                  placeholder="Address"
                  className="w-full rounded-2xl border border-emerald-100/70 bg-slate-50 px-4 py-3 text-sm text-slate-700 shadow-inner shadow-emerald-50 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                  required
                  onChange={handleChange}
                  value={formData.address}
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {"sale rent parking furnished offer"
                  .split(" ")
                  .map((option) => (
                    <label
                      key={option}
                      className="flex items-center justify-between rounded-2xl border border-emerald-100/70 bg-slate-50/70 px-4 py-3 text-sm font-medium text-slate-600 shadow-inner shadow-emerald-50 transition hover:border-emerald-300"
                    >
                      <span className="capitalize">
                        {option === "sale"
                          ? "Sell"
                          : option === "parking"
                          ? "Parking spot"
                          : option === "offer"
                          ? "Offer"
                          : option}
                      </span>
                      <input
                        type="checkbox"
                        id={option}
                        className="h-4 w-4 rounded border-slate-300 text-emerald-500 focus:ring-emerald-300"
                        onChange={handleChange}
                        checked={
                          option === "sale"
                            ? formData.type === "sale"
                            : option === "rent"
                            ? formData.type === "rent"
                            : formData[option]
                        }
                      />
                    </label>
                  ))}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center justify-between rounded-2xl border border-emerald-100/70 bg-slate-50/70 px-4 py-3 shadow-inner shadow-emerald-50">
                  <div>
                    <p className="text-sm font-semibold text-slate-600">Beds</p>
                  </div>
                  <input
                    type="number"
                    id="bedrooms"
                    min="1"
                    max="10"
                    required
                    className="w-16 rounded-xl border border-emerald-100/70 bg-white px-3 py-2 text-sm text-slate-700 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                    onChange={handleChange}
                    value={formData.bedrooms}
                  />
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-emerald-100/70 bg-slate-50/70 px-4 py-3 shadow-inner shadow-emerald-50">
                  <div>
                    <p className="text-sm font-semibold text-slate-600">
                      Baths
                    </p>
                  </div>
                  <input
                    type="number"
                    id="bathrooms"
                    min="1"
                    max="10"
                    required
                    className="w-16 rounded-xl border border-emerald-100/70 bg-white px-3 py-2 text-sm text-slate-700 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                    onChange={handleChange}
                    value={formData.bathrooms}
                  />
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-emerald-100/70 bg-slate-50/70 px-4 py-3 shadow-inner shadow-emerald-50 sm:col-span-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-600">
                      Regular price
                    </p>
                    <span className="text-xs text-slate-400">($/month)</span>
                  </div>
                  <input
                    type="number"
                    id="regularPrice"
                    min="50"
                    max="10000000"
                    required
                    className="w-24 rounded-xl border border-emerald-100/70 bg-white px-3 py-2 text-sm text-slate-700 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                    onChange={handleChange}
                    value={formData.regularPrice}
                  />
                </div>
                {formData.offer && (
                  <div className="flex items-center justify-between rounded-2xl border border-emerald-100/70 bg-slate-50/70 px-4 py-3 shadow-inner shadow-emerald-50 sm:col-span-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-600">
                        Discounted price
                      </p>
                      <span className="text-xs text-slate-400">($/month)</span>
                    </div>
                    <input
                      type="number"
                      id="discountPrice"
                      min="0"
                      max="1000000"
                      required
                      className="w-24 rounded-xl border border-emerald-100/70 bg-white px-3 py-2 text-sm text-slate-700 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                      onChange={handleChange}
                      value={formData.discountPrice}
                    />
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className="space-y-6 rounded-3xl border border-emerald-100 bg-white/85 p-6 shadow-xl shadow-emerald-100/60 backdrop-blur-sm sm:p-8">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-500">
                Images
              </p>
              <p className="mt-1 text-sm text-slate-500">
                The first image will be the cover (max 6)
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <input
                onChange={(e) => setFiles(e.target.files)}
                className="flex-1 rounded-2xl border border-emerald-100/70 bg-slate-50 px-4 py-3 text-sm text-slate-600 shadow-inner shadow-emerald-50 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                type="file"
                id="images"
                accept="image/*"
                multiple
              />

              <button
                onClick={handleImageSubmit}
                type="button"
                className="inline-flex items-center justify-center rounded-full border border-emerald-500 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-emerald-600 transition hover:border-emerald-400 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {uploading ? "Uploading" : "Upload"}
              </button>
            </div>

            {uploading && (
              <div className="flex justify-center">
                <Lottie
                  animationData={animationData}
                  loop
                  className="h-28 w-28"
                />
              </div>
            )}

            {imageUploadError && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                {imageUploadError}
              </div>
            )}

            {formData.imageUrls.length > 0 && (
              <div className="space-y-3">
                {formData.imageUrls.map((url, index) => (
                  <div
                    className="flex items-center justify-between gap-4 rounded-2xl border border-emerald-100/80 bg-slate-50 px-4 py-3 shadow-sm"
                    key={url}
                  >
                    <img
                      src={url}
                      alt="listing image"
                      className="h-16 w-16 rounded-xl object-cover"
                    />
                    <button
                      className="text-sm font-semibold uppercase tracking-[0.2em] text-red-500 transition hover:text-red-600"
                      onClick={() => handleRemoveImage(index)}
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              disabled={loading || uploading}
              className="w-full rounded-full bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white shadow-lg shadow-slate-400/30 transition hover:from-slate-800 hover:via-slate-700 hover:to-slate-900 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Updating..." : "Update Listing"}
            </button>

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                {error}
              </div>
            )}
          </section>
        </form>
      </div>
    </main>
  );
}
