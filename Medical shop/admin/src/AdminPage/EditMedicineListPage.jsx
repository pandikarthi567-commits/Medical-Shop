/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Package2,
  Pill,
  BadgeIndianRupee,
  Boxes,
  SquarePen,
  CalendarDays,
  RefreshCcw,
} from "lucide-react";
import API from "../api/axios";
import { pageVariants, itemVariants } from "./components/pageMotion";
import { clearAdminSession, getAdminToken } from "../utils/auth";

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "N/A";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const EditMedicineListPage = () => {
  const navigate = useNavigate();

  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");

  const fetchMedicines = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const token = getAdminToken();

      if (!token) {
        navigate("/admin/login");
        return;
      }

      const { data } = await API.get("/medicines/admin/all", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setMedicines(data?.medicines || []);
    } catch (error) {
      console.error("Fetch medicines error:", error);

      if (error.response?.status === 401) {
        clearAdminSession();
        navigate("/admin/login");
        return;
      }

      setError(error.response?.data?.message || "Failed to load medicines");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, [navigate]);

  const filteredMedicines = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) return medicines;

    return medicines.filter((medicine) => {
      const searchableText = [
        medicine?.name,
        medicine?.category,
        medicine?.description,
        String(medicine?.stock ?? ""),
        String(medicine?.price ?? ""),
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [medicines, searchTerm]);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-2xl bg-white p-6 shadow-sm"
      >
        <p className="text-slate-600">Loading medicines...</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-6"
    >
      <motion.div
        variants={itemVariants}
        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Edit Medicines</h1>
            <p className="mt-1 text-sm text-slate-500">
              Search medicines and open any card to update details.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative w-full md:w-96">
              <Search
                size={18}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search by name, category, description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-11 w-full rounded-xl border border-slate-300 bg-slate-50 pl-10 pr-4 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white"
              />
            </div>

            <button
              onClick={() => fetchMedicines(true)}
              disabled={refreshing}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
            >
              <RefreshCcw
                size={16}
                className={refreshing ? "animate-spin" : ""}
              />
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-500">
          <span className="rounded-full bg-slate-100 px-3 py-1">
            Total: {medicines.length}
          </span>
          <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">
            Showing: {filteredMedicines.length}
          </span>
        </div>
      </motion.div>

      {error ? (
        <motion.div
          variants={itemVariants}
          className="rounded-2xl border border-red-200 bg-red-50 p-5 shadow-sm"
        >
          <p className="text-red-700">{error}</p>
        </motion.div>
      ) : filteredMedicines.length === 0 ? (
        <motion.div
          variants={itemVariants}
          className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm"
        >
          <Package2 className="mx-auto mb-3 text-slate-400" size={40} />
          <h2 className="text-lg font-semibold text-slate-800">
            No medicines found
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Try a different keyword in the search bar.
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence>
            {filteredMedicines.map((medicine) => (
              <motion.div
                key={medicine._id}
                layout
                variants={itemVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                whileHover={{ y: -4 }}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
              >
                <div className="flex items-start gap-4 border-b border-slate-100 bg-slate-50 p-4">
                  <div className="h-20 w-20 overflow-hidden rounded-xl border border-slate-200 bg-white">
                    {medicine?.image ? (
                      <img
                        src={medicine.image}
                        alt={medicine.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-slate-400">
                        <Pill size={28} />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h2 className="line-clamp-2 text-lg font-semibold text-slate-900">
                      {medicine.name}
                    </h2>
                    <p className="mt-1 inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                      {medicine.category || "Uncategorized"}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 p-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-xl bg-slate-50 p-3">
                      <div className="mb-1 flex items-center gap-2 text-slate-500">
                        <BadgeIndianRupee size={15} />
                        <span>Price</span>
                      </div>
                      <p className="font-semibold text-slate-900">
                        ₹{medicine.price ?? 0}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-3">
                      <div className="mb-1 flex items-center gap-2 text-slate-500">
                        <Boxes size={15} />
                        <span>Stock</span>
                      </div>
                      <p className="font-semibold text-slate-900">
                        {medicine.stock ?? 0}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-3 text-sm">
                    <div className="mb-1 flex items-center gap-2 text-slate-500">
                      <CalendarDays size={15} />
                      <span>Expiry Date</span>
                    </div>
                    <p className="font-medium text-slate-800">
                      {formatDate(medicine.expiryDate)}
                    </p>
                  </div>

                  <p className="line-clamp-3 text-sm text-slate-600">
                    {medicine.description || "No description available."}
                  </p>

                  <Link
                    to={`/admin/medicines/edit/${medicine._id}`}
                    className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    <SquarePen size={16} />
                    Edit Medicine
                  </Link>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
};

export default EditMedicineListPage;