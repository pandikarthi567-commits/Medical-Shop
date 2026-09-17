/* eslint-disable no-unused-vars */
import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";

import MainLayout from "./components/MainLayout";
import Landingpage from "./components/Landingpage";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import ProductsPage from "./components/ProductsPage";
import HealthcarePage from "./components/HealthcarePage";
import CategoriesPage from "./components/CategoriesPage";
import ContactPage from "./components/ContactPage";
import OffersPage from "./components/OffersPage";
import CartPage from "./components/CartPage";
import Prescription from "./components/Prescription";
import TrackOrder from "./components/TrackOrder";
import NotificationsPage from "./components/NotificationsPage";
import WishlistPage from "./components/WishlistPage";
import CheckoutPage from "./components/CheckoutPage"; 
import PaymentReturnPage from "./components/PaymentReturnPage";
import MyOrdersPage from "./components/MyOrdersPage";
import MyPrescriptionsPage from "./components/MyPrescriptionsPage";
import ProfileOrderDetailsPage from "./components/ProfileOrderDetailsPage";

const ProtectedRoute = () => {
  const token = localStorage.getItem("token");
  return token ? <Outlet /> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Landingpage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/healthcare" element={<HealthcarePage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/offers" element={<OffersPage />} />

          {/* Protected Routes - Accessible only when logged in */}
          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<Profile />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/orders" element={<MyOrdersPage />} />
            <Route path="/profile/orders" element={<MyOrdersPage />} />
            <Route path="/profile/orders/:id" element={<ProfileOrderDetailsPage />} />
            <Route path="/prescriptions" element={<MyPrescriptionsPage />} />
            <Route path="/prescription" element={<MyPrescriptionsPage />} />
            <Route path="/track-order" element={<TrackOrder />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/payment-return" element={<PaymentReturnPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;