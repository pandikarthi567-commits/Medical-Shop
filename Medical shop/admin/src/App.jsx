import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import AdminLayout from "./AdminPage/components/AdminLayout";
import AdminRoute from "./AdminPage/AdminRoute";
import AdminLoginPage from "./AdminPage/AdminLoginPage";
import DashboardPage from "./AdminPage/DashboardPage";
import SalesPage from "./AdminPage/SalesPage";
import OrderDetailsPage from "./AdminPage/OrderDetailsPage";
import AdminLiveTracking from "./AdminPage/AdminLiveTracking";
import EditMedicineListPage from "./AdminPage/EditMedicineListPage";
import EditMedicine from "./AdminPage/EditMedicine";
import LowStockPage from "./AdminPage/LowStockPage";
import ExpiryManagementPage from "./AdminPage/ExpiryManagementPage";
import CustomersPage from "./AdminPage/CustomersPage";
import SuppliersPage from "./AdminPage/SuppliersPage";
import AdminOffersPage from "./AdminPage/AdminOffersPage";
import ReportsPage from "./AdminPage/ReportsPage";
import PurchasePage from "./AdminPage/PurchasePage";
import InventoryPage from "./AdminPage/InventoryPage";
import AddMedicine from "./AdminPage/AddMedicine";
import ManageMedicinesPage from "./AdminPage/ManageMedicinesPage";
import DeliveryBoysPage from "./AdminPage/DeliveryBoysPage";
import GlowCursor from "./components/GlowCursor";

function App() {
  return (
    <>
      <GlowCursor
        primaryColor="#059669"
        secondaryColor="#0284C7"
        ringSize={28}
        hoverRingSize={46}
        dotSize={5}
        showTrail={true}
      />
      <BrowserRouter>
        <Routes>
          {/* Public Admin Auth */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/login" element={<Navigate to="/admin/login" replace />} />

        {/* Protected Admin Routes */}
        <Route
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          {/* Main Dashboard */}
          <Route path="/admin" element={<DashboardPage />} />
          <Route path="/admin/dashboard" element={<DashboardPage />} />
          <Route path="/" element={<DashboardPage />} />

          {/* Sales & Transactions */}
          <Route path="/admin/sales" element={<SalesPage />} />
          <Route path="/admin/orders" element={<SalesPage />} />
          <Route path="/admin/orders/live-tracking" element={<AdminLiveTracking />} />
          <Route path="/admin/live-tracking" element={<AdminLiveTracking />} />
          <Route path="/admin/delivery-boys" element={<DeliveryBoysPage />} />
          <Route path="/admin/riders" element={<DeliveryBoysPage />} />
          <Route path="/admin/orders/:id" element={<OrderDetailsPage />} />

          {/* Customers & Suppliers */}
          <Route path="/admin/customers" element={<CustomersPage />} />
          <Route path="/admin/suppliers" element={<SuppliersPage />} />

          {/* Medicines & Inventory */}
          <Route path="/admin/medicines" element={<InventoryPage />} />
          <Route path="/admin/inventory" element={<InventoryPage />} />
          <Route path="/admin/medicines/manage" element={<ManageMedicinesPage />} />
          <Route path="/admin/medicines/list" element={<ManageMedicinesPage />} />
          <Route path="/admin/medicines/add" element={<AddMedicine />} />
          <Route path="/admin/medicines/edit/:id" element={<EditMedicine />} />
          <Route path="/admin/medicines/low-stock" element={<LowStockPage />} />
          <Route path="/admin/expiry" element={<ExpiryManagementPage />} />
          <Route path="/admin/expiry-management" element={<ExpiryManagementPage />} />
          <Route path="/admin/medicines/expiry" element={<ExpiryManagementPage />} />

          {/* Purchases */}
          <Route path="/admin/purchases" element={<PurchasePage />} />
          <Route path="/purchases" element={<Navigate to="/admin/purchases" replace />} />

          {/* Offers & Reports */}
          <Route path="/admin/offers" element={<AdminOffersPage />} />
          <Route path="/admin/reports" element={<ReportsPage />} />

          {/* Aliases without /admin prefix */}
          <Route path="/customers" element={<Navigate to="/admin/customers" replace />} />
          <Route path="/suppliers" element={<Navigate to="/admin/suppliers" replace />} />

          {/* Aliases without /admin prefix */}
          <Route path="/sales" element={<Navigate to="/admin/sales" replace />} />
          <Route path="/orders" element={<Navigate to="/admin/sales" replace />} />
          <Route path="/medicines" element={<Navigate to="/admin/medicines" replace />} />
          <Route path="/reports" element={<Navigate to="/admin/reports" replace />} />
          <Route path="/offers" element={<Navigate to="/admin/offers" replace />} />
        </Route>

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </BrowserRouter>
    </>
  );
}

export default App;
