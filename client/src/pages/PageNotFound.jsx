import React from "react";
import Lottie from "lottie-react";
import animationData from "../assets/404.json";

export default function PageNotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4 text-center">
      <Lottie
        animationData={animationData}
        loop={true}
        className="w-64 h-64" // Smaller size
      />
      <h1 className="text-2xl font-semibold text-slate-700">Page Not Found</h1>
      <p className="text-slate-500">
        The page you are looking for doesn't exist.
      </p>
    </div>
  );
}
