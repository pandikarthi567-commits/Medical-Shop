import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ImagePlus,
  PackageSearch,
  Save,
  Shapes,
  Pill,
  IndianRupee,
  Boxes,
  FileText,
  CalendarDays,
} from "lucide-react";
import API from "../api/axios";
import { pageVariants, itemVariants, fadeUp } from "./components/pageMotion";
import { clearAdminSession, getAdminToken } from "../utils/auth";

const formatDateForInput = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().split("T")[0];
};

const EditMedicine = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const previewUrlRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    stock: "",
    expiryDate: "",
    image: "",
    description: "",
  });

  const [categories, setCategories] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [previewImage, setPreviewImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id || id.length !== 24) {
      alert("Invalid medicine ID");
      navigate("/admin/medicines");
      return;
    }

    const token = getAdminToken();

    if (!token) {
      navigate("/admin/login");
      return;
    }

    const fetchMedicineAndCategories = async () => {
      try {
        const [medicineResponse, categoryResponse] = await Promise.all([
          API.get(`/medicines/admin/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          API.get("/medicines/categories/list", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const medicine = medicineResponse?.data?.medicine;

        const fetchedCategories = (categoryResponse?.data?.categories || [])
          .filter((cat) => cat?.name && cat.name !== "All")
          .map((cat) => ({
            _id: cat._id || cat.slug || cat.name,
            name: cat.name,
          }));

        setCategories(fetchedCategories);

        if (medicine) {
          setFormData({
            name: medicine.name || "",
            category: medicine.category || "",
            price: medicine.price ?? "",
            stock: medicine.stock ?? "",
            expiryDate: formatDateForInput(medicine.expiryDate),
            image: medicine.image || "",
            description: medicine.description || "",
          });

          setPreviewImage(medicine.image || "");
        }
      } catch (error) {
        console.error("Fetch error:", error);

        if (error.response?.status === 401) {
          clearAdminSession();
          navigate("/admin/login");
          return;
        }

        alert(error.response?.data?.message || "Failed to load medicine details");
      } finally {
        setLoading(false);
      }
    };

    fetchMedicineAndCategories();
  }, [id, navigate]);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  const mergedCategories = useMemo(() => {
    const existing = [...categories];

    const hasCurrentCategory = existing.some(
      (cat) => cat.name === formData.category
    );

    if (formData.category && !hasCurrentCategory) {
      existing.unshift({
        _id: "current-category",
        name: formData.category,
      });
    }

    return existing;
  }, [categories, formData.category]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "image" && !imageFile) {
      setPreviewImage(value);
    }
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];

    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }

    if (!file) {
      setImageFile(null);
      setPreviewImage(formData.image || "");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    previewUrlRef.current = objectUrl;

    setImageFile(file);
    setPreviewImage(objectUrl);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = getAdminToken();

      if (!token) {
        navigate("/admin/login");
        return;
      }

      const payload = new FormData();

      payload.append("name", formData.name.trim());
      payload.append("category", formData.category.trim());
      payload.append("price", String(formData.price).trim());
      payload.append("stock", String(formData.stock).trim());
      payload.append("expiryDate", formData.expiryDate);
      payload.append("description", formData.description.trim());

      if (imageFile) {
        payload.append("image", imageFile);
      } else if (formData.image?.trim()) {
        payload.append("image", formData.image.trim());
      }

      const response = await API.put(`/medicines/admin/${id}`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert(response?.data?.message || "Medicine updated successfully");
      navigate("/admin/medicines");
    } catch (error) {
      console.error("Update error:", error);

      if (error.response?.status === 401) {
        clearAdminSession();
        navigate("/admin/login");
        return;
      }

      alert(error.response?.data?.message || "Update failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-2xl bg-white p-6 shadow-sm"
      >
        <p className="text-slate-600">Loading medicine data...</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="mx-auto max-w-5xl space-y-6"
    >
      <motion.div
        variants={itemVariants}
        className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Edit Medicine</h1>
          <p className="mt-1 text-sm text-slate-500">
            Update medicine information, image, stock, and expiry date.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/admin/medicines")}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          <ArrowLeft size={16} />
          Back to List
        </button>
      </motion.div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <motion.div
          variants={itemVariants}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-1"
        >
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            Preview Card
          </h2>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
            <div className="flex h-56 items-center justify-center bg-white p-4">
              {previewImage ? (
                <img
                  src={previewImage}
                  alt="Medicine preview"
                  className="h-full w-full rounded-xl object-cover"
                />
              ) : (
                <div className="flex flex-col items-center text-slate-400">
                  <PackageSearch size={36} />
                  <p className="mt-2 text-sm">No image selected</p>
                </div>
              )}
            </div>

            <div className="space-y-3 p-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  {formData.name || "Medicine name"}
                </h3>
                <p className="mt-1 inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                  {formData.category || "Category"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl bg-white p-3">
                  <p className="text-slate-500">Price</p>
                  <p className="font-semibold text-slate-900">
                    ₹{formData.price || 0}
                  </p>
                </div>
                <div className="rounded-xl bg-white p-3">
                  <p className="text-slate-500">Stock</p>
                  <p className="font-semibold text-slate-900">
                    {formData.stock || 0}
                  </p>
                </div>
              </div>

              <div className="rounded-xl bg-white p-3 text-sm">
                <p className="text-slate-500">Expiry Date</p>
                <p className="font-medium text-slate-900">
                  {formData.expiryDate || "Not selected"}
                </p>
              </div>

              <p className="text-sm text-slate-600">
                {formData.description ||
                  "Medicine description preview appears here."}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.form
          variants={itemVariants}
          onSubmit={handleSubmit}
          className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2"
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <motion.div variants={fadeUp} className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <Pill size={16} />
                Medicine Name
              </label>
              <input
                type="text"
                name="name"
                placeholder="Enter medicine name"
                value={formData.name}
                onChange={handleChange}
                className="h-11 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-blue-500"
                required
              />
            </motion.div>

            <motion.div variants={fadeUp} className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <Shapes size={16} />
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`h-11 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-blue-500 ${
                  !formData.category ? "text-gray-400" : "text-black"
                }`}
                required
              >
                <option value="" disabled>
                  Select Category
                </option>

                {mergedCategories.map((cat) => (
                  <option key={cat._id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </motion.div>

            <motion.div variants={fadeUp} className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <IndianRupee size={16} />
                Price
              </label>
              <input
                type="number"
                name="price"
                placeholder="Enter price"
                value={formData.price}
                onChange={handleChange}
                className="h-11 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-blue-500"
                min="0"
                step="0.01"
                required
              />
            </motion.div>

            <motion.div variants={fadeUp} className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <Boxes size={16} />
                Stock
              </label>
              <input
                type="number"
                name="stock"
                placeholder="Enter stock quantity"
                value={formData.stock}
                onChange={handleChange}
                className="h-11 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-blue-500"
                min="0"
                required
              />
            </motion.div>

            <motion.div variants={fadeUp} className="space-y-2 md:col-span-2">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <CalendarDays size={16} />
                Expiry Date
              </label>
              <input
                type="date"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
                className="h-11 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-blue-500"
                required
              />
            </motion.div>

            <motion.div variants={fadeUp} className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-slate-700">
                Image URL
              </label>
              <input
                type="text"
                name="image"
                placeholder="Paste image URL"
                value={formData.image}
                onChange={handleChange}
                className="h-11 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-blue-500 disabled:bg-slate-100"
                disabled={!!imageFile}
              />
            </motion.div>

            <motion.div variants={fadeUp} className="space-y-2 md:col-span-2">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <ImagePlus size={16} />
                Upload New Image
              </label>
              <input
                type="file"
                name="imageFile"
                accept="image/*"
                onChange={handleImageFileChange}
                className="block w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-700 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-100"
              />
            </motion.div>

            <motion.div variants={fadeUp} className="space-y-2 md:col-span-2">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <FileText size={16} />
                Description
              </label>
              <textarea
                name="description"
                placeholder="Enter medicine description"
                value={formData.description}
                onChange={handleChange}
                className="min-h-30 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
                rows="4"
              />
            </motion.div>
          </div>

          <AnimatePresence mode="wait">
            {previewImage && (
              <motion.div
                key={previewImage}
                initial={{ opacity: 0, scale: 0.98, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: -8 }}
                transition={{ duration: 0.25 }}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
              >
                <p className="mb-3 text-sm font-medium text-slate-700">
                  Current Image Preview
                </p>
                <img
                  src={previewImage}
                  alt="Medicine preview"
                  className="h-40 w-40 rounded-xl border border-slate-200 object-cover"
                />
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div variants={fadeUp} className="flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save size={16} />
              {submitting ? "Updating..." : "Update Medicine"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/admin/medicines")}
              className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>
          </motion.div>
        </motion.form>
      </div>
    </motion.div>
  );
};

export default EditMedicine;