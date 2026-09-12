/* eslint-disable no-unused-vars */
import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import Landingpage from "../components/Landingpage";
import TrackOrder from "../components/TrackOrder";
import Prescription from "../components/Prescription";
import CartPage from "../components/CartPage";
import NotificationsPage from "../components/NotificationsPage";
import WishlistPage from "../components/WishlistPage";
import ProductsPage from "../components/ProductsPage";
import HealthcarePage from "../components/HealthcarePage";
import CategoriesPage from "../components/CategoriesPage";
import ContactPage from "../components/ContactPage";
import OffersPage from "../components/OffersPage";
import Login from "./Login";
import Profile from "./Profile";

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Landingpage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/healthcare" element={<HealthcarePage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/offers" element={<OffersPage />} />
        <Route path="/track-order" element={<TrackOrder />} />
        <Route path="/prescription" element={<Prescription />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
      </Routes>
    </AnimatePresence>
  );
};

export default AnimatedRoutes;