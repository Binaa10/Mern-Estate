import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";
import Home from "./pages/Home";
import About from "./pages/About";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Header from "./components/Header";
import PrivateRoute from "./components/PrivateRoute.jsx";
import CreateListing from "./pages/CreateListing.jsx";
import UpdateListing from "./pages/UpdateListing.jsx";
import Listing from "./pages/Listing.jsx";
import Search from "./pages/Search.jsx";
import Footer from "./components/Footer.jsx";
import { Toaster } from "react-hot-toast";
import PageNotFound from "./pages/PageNotFound.jsx";
import AdminRoute from "./components/AdminRoute.jsx";
import AdminDashboard from "./pages/admin/Dashboard.jsx";
import Analytics from "./pages/admin/Analytics.jsx";
import UserManagement from "./pages/admin/UserManagement.jsx";
import Properties from "./pages/admin/Properties.jsx";
import AdminProfile from "./pages/admin/AdminProfile.jsx";
import AdminLayout from "./pages/admin/AdminLayout.jsx";
import AdminCreateListing from "./pages/admin/AdminCreateListing.jsx";
import AdminMyListings from "./pages/admin/AdminMyListings.jsx";
import UserLayout from "./pages/user/UserLayout.jsx";
import UserDashboard from "./pages/user/UserDashboard.jsx";
import UserMyListings from "./pages/user/UserMyListings.jsx";
import UserProfile from "./pages/user/UserProfile.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Header />

      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        <Route path="/" element={<Home />}></Route>
        <Route path="/sign-in" element={<SignIn />}></Route>
        <Route path="/sign-up" element={<SignUp />}></Route>
        <Route path="/about" element={<About />}></Route>
        <Route path="/privacy-policy" element={<PrivacyPolicy />}></Route>
        <Route path="listing/:listingId" element={<Listing />}></Route>
        <Route path="/search" element={<Search />}></Route>
        <Route element={<PrivateRoute />}>
          <Route path="/account" element={<UserLayout />}>
            <Route index element={<UserDashboard />} />
            <Route path="create-listing" element={<CreateListing />} />
            <Route path="my-listings" element={<UserMyListings />} />
            <Route path="profile" element={<UserProfile />} />
          </Route>
          <Route
            path="/profile"
            element={<Navigate to="/account/profile" replace />}
          />
          <Route
            path="/create-listing"
            element={<Navigate to="/account/create-listing" replace />}
          />
          <Route
            path="/update-listing/:listingId"
            element={<UpdateListing />}
          />
        </Route>
        <Route path="/admin" element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="properties" element={<Properties />} />
            <Route path="create-listing" element={<AdminCreateListing />} />
            <Route path="my-listings" element={<AdminMyListings />} />
            <Route path="profile" element={<AdminProfile />} />
          </Route>
        </Route>
        <Route path="*" element={<PageNotFound />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}
