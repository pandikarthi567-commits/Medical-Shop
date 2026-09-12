/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import API from "../../api/axios";
import {
  cardVariants,
  sectionVariants,
} from "../../utils/motionVariants";

const formatExpiryDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

const getTodayString = () => {
  const today = new Date();
  today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  return today.toISOString().slice(0, 10);
};

const getInitialFormState = (initialData = {}) => ({
  name: initialData.name || "",
  description: initialData.description || "",
  price: initialData.price ?? "",
  oldPrice: initialData.oldPrice ?? "",
  stock: initialData.stock ?? "",
  category: initialData.category || "",
  prescriptionRequired: initialData.prescriptionRequired ?? false,
  expiryDate: formatExpiryDate(initialData.expiryDate),
  rating: initialData.rating ?? 4,
  reviewCount: initialData.reviewCount ?? 0,
  badge: initialData.badge || "",
  brand: initialData.brand || "",
  lowStockThreshold: initialData.lowStockThreshold ?? 10,
  image: null,
});

const fieldClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition-all duration-300 ease-out placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100";

const labelClass = "mb-2 block text-sm font-medium text-slate-700";

const cardClass =
  "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300 ease-out hover:shadow-md sm:p-5";

const hintClass = "mt-2 text-xs text-slate-500";
const errorClass = "mt-2 text-xs text-red-500";

const MedicineForm = ({ initialData, onSubmit, buttonText = "Submit" }) => {
  const safeInitialData = initialData ?? {};
  const fileInputRef = useRef(null);

  const initialFormState = useMemo(
    () => getInitialFormState(safeInitialData),
    [
      safeInitialData.name,
      safeInitialData.description,
      safeInitialData.price,
      safeInitialData.oldPrice,
      safeInitialData.stock,
      safeInitialData.category,
      safeInitialData.prescriptionRequired,
      safeInitialData.expiryDate,
      safeInitialData.rating,
      safeInitialData.reviewCount,
      safeInitialData.badge,
      safeInitialData.brand,
      safeInitialData.lowStockThreshold,
    ]
  );

  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(initialFormState);
  const [previewUrl, setPreviewUrl] = useState(safeInitialData.image || "");
  const [isRemovingImage, setIsRemovingImage] = useState(false);

  useEffect(() => {
    setForm(initialFormState);
  }, [initialFormState]);

  useEffect(() => {
    setPreviewUrl(safeInitialData.image || "");
  }, [safeInitialData.image]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await API.get("/medicines/categories/list");
        const realCategories = (data?.categories || []).filter(
          (c) => c?.name && c.name !== "All"
        );
        setCategories(realCategories);
      } catch (error) {
        console.error("Category fetch error:", error);
        setCategories([]);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    if (!(form.image instanceof File)) return;

    const objectUrl = URL.createObjectURL(form.image);
    setPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [form.image]);

  const mergedCategories = useMemo(() => {
    const list = [...categories];
    const trimmedCategory = String(form.category || "").trim();

    const exists = list.some(
      (cat) => String(cat.name).trim().toLowerCase() === trimmedCategory.toLowerCase()
    );

    if (trimmedCategory && !exists) {
      list.unshift({
        _id: "current-category",
        name: trimmedCategory,
      });
    }

    return list;
  }, [categories, form.category]);

  const changeHandler = (e) => {
    const { name, value, type, checked, files } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : type === "file"
          ? files && files[0]
            ? files[0]
            : null
          : value,
    }));
  };

  const handleRemoveImage = () => {
    setIsRemovingImage(true);

    setTimeout(() => {
      setForm((prev) => ({
        ...prev,
        image: null,
      }));
      setPreviewUrl("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setIsRemovingImage(false);
    }, 220);
  };

  const validateForm = () => {
    const trimmedName = form.name.trim();
    const trimmedCategory = form.category.trim();

    if (!trimmedName) {
      alert("Medicine name is required");
      return false;
    }

    if (!trimmedCategory) {
      alert("Category is required");
      return false;
    }

    if (categories.length === 0) {
      alert("No active categories available. Add categories first.");
      return false;
    }

    const validCategory = categories.some(
      (c) => String(c.name).trim().toLowerCase() === trimmedCategory.toLowerCase()
    );

    const isCurrentEditCategory =
      safeInitialData.category &&
      String(safeInitialData.category).trim().toLowerCase() ===
        trimmedCategory.toLowerCase();

    if (!validCategory && !isCurrentEditCategory) {
      alert("Please select a valid active category from the database");
      return false;
    }

    if (form.price === "" || Number(form.price) < 0) {
      alert("Valid price is required");
      return false;
    }

    if (form.stock === "" || Number(form.stock) < 0) {
      alert("Valid stock is required");
      return false;
    }

    if (!form.expiryDate) {
      alert("Expiry date is required");
      return false;
    }

    if (form.expiryDate < getTodayString()) {
      alert("Expiry date cannot be in the past");
      return false;
    }

    if (form.oldPrice !== "" && Number(form.oldPrice) < 0) {
      alert("Old price cannot be negative");
      return false;
    }

    if (form.lowStockThreshold !== "" && Number(form.lowStockThreshold) < 0) {
      alert("Low stock threshold cannot be negative");
      return false;
    }

    if (form.rating !== "" && (Number(form.rating) < 0 || Number(form.rating) > 5)) {
      alert("Rating must be between 0 and 5");
      return false;
    }

    if (form.reviewCount !== "" && Number(form.reviewCount) < 0) {
      alert("Review count cannot be negative");
      return false;
    }

    return true;
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setSubmitting(true);

      const formData = new FormData();
      formData.append("name", form.name.trim());
      formData.append("description", form.description.trim());
      formData.append("price", String(form.price).trim());
      formData.append("stock", String(form.stock).trim());
      formData.append("category", form.category.trim());
      formData.append("prescriptionRequired", String(form.prescriptionRequired));
      formData.append("expiryDate", form.expiryDate);
      formData.append("rating", String(form.rating).trim());
      formData.append("reviewCount", String(form.reviewCount).trim());
      formData.append("badge", form.badge.trim());
      formData.append("brand", form.brand.trim());
      formData.append(
        "lowStockThreshold",
        String(form.lowStockThreshold).trim()
      );

      if (
        form.oldPrice !== "" &&
        form.oldPrice !== null &&
        form.oldPrice !== undefined
      ) {
        formData.append("oldPrice", String(form.oldPrice).trim());
      }

      if (form.image instanceof File) {
        formData.append("image", form.image);
      }

      await onSubmit(formData);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.form
      onSubmit={submitHandler}
      variants={sectionVariants}
      initial="hidden"
      animate="visible"
      className="rounded-3xl border border-slate-200 bg-linear-to-br from-white to-slate-50 p-4 shadow-lg sm:p-6 md:p-8"
    >
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800 sm:text-2xl">Medicine Details</h2>
        <p className="mt-1 text-sm text-slate-500">
          Add medicine information, stock details, category, and image.
        </p>
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        transition={{ staggerChildren: 0.06 }}
        className="grid gap-4 sm:gap-5 md:grid-cols-2"
      >
        <motion.div variants={cardVariants} whileHover={{ y: -3 }} className={cardClass}>
          <label htmlFor="name" className={labelClass}>Medicine Name</label>
          <input
            id="name"
            name="name"
            value={form.name}
            onChange={changeHandler}
            placeholder="Enter medicine name"
            className={fieldClass}
            required
          />
        </motion.div>

        <motion.div variants={cardVariants} whileHover={{ y: -3 }} className={cardClass}>
          <label htmlFor="brand" className={labelClass}>Brand</label>
          <input
            id="brand"
            name="brand"
            value={form.brand}
            onChange={changeHandler}
            placeholder="Enter brand name"
            className={fieldClass}
          />
        </motion.div>

        <motion.div variants={cardVariants} whileHover={{ y: -3 }} className={cardClass}>
          <label htmlFor="category" className={labelClass}>Category</label>
          <select
            id="category"
            name="category"
            value={form.category}
            onChange={changeHandler}
            className={fieldClass}
            required
            disabled={loadingCategories || categories.length === 0}
          >
            <option value="">
              {loadingCategories
                ? "Loading categories..."
                : categories.length === 0
                ? "No active categories available"
                : "Select category"}
            </option>

            {mergedCategories.map((cat) => (
              <option key={cat._id || cat.slug || cat.name} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>

          {categories.length === 0 && !loadingCategories ? (
            <p className={errorClass}>
              No active categories found. Add categories in admin first.
            </p>
          ) : (
            <p className={hintClass}>
              Only active categories from the database are shown.
            </p>
          )}
        </motion.div>

        <motion.div variants={cardVariants} whileHover={{ y: -3 }} className={cardClass}>
          <label htmlFor="expiryDate" className={labelClass}>Expiry Date</label>
          <input
            id="expiryDate"
            name="expiryDate"
            value={form.expiryDate}
            onChange={changeHandler}
            type="date"
            min={getTodayString()}
            className={fieldClass}
            required
          />
        </motion.div>

        <motion.div variants={cardVariants} whileHover={{ y: -3 }} className={cardClass}>
          <label htmlFor="price" className={labelClass}>Price</label>
          <input
            id="price"
            name="price"
            value={form.price}
            onChange={changeHandler}
            placeholder="Enter price"
            type="number"
            min="0"
            step="0.01"
            className={fieldClass}
            required
          />
        </motion.div>

        <motion.div variants={cardVariants} whileHover={{ y: -3 }} className={cardClass}>
          <label htmlFor="oldPrice" className={labelClass}>Old Price</label>
          <input
            id="oldPrice"
            name="oldPrice"
            value={form.oldPrice}
            onChange={changeHandler}
            placeholder="Enter old price"
            type="number"
            min="0"
            step="0.01"
            className={fieldClass}
          />
        </motion.div>

        <motion.div variants={cardVariants} whileHover={{ y: -3 }} className={cardClass}>
          <label htmlFor="stock" className={labelClass}>Stock</label>
          <input
            id="stock"
            name="stock"
            value={form.stock}
            onChange={changeHandler}
            placeholder="Enter stock quantity"
            type="number"
            min="0"
            className={fieldClass}
            required
          />
        </motion.div>

        <motion.div variants={cardVariants} whileHover={{ y: -3 }} className={cardClass}>
          <label htmlFor="lowStockThreshold" className={labelClass}>Low Stock Threshold</label>
          <input
            id="lowStockThreshold"
            name="lowStockThreshold"
            value={form.lowStockThreshold}
            onChange={changeHandler}
            placeholder="Enter low stock threshold"
            type="number"
            min="0"
            className={fieldClass}
          />
        </motion.div>

        <motion.div variants={cardVariants} whileHover={{ y: -3 }} className={cardClass}>
          <label htmlFor="rating" className={labelClass}>Rating</label>
          <input
            id="rating"
            name="rating"
            value={form.rating}
            onChange={changeHandler}
            placeholder="Enter rating"
            type="number"
            min="0"
            max="5"
            step="0.1"
            className={fieldClass}
          />
        </motion.div>

        <motion.div variants={cardVariants} whileHover={{ y: -3 }} className={cardClass}>
          <label htmlFor="reviewCount" className={labelClass}>Review Count</label>
          <input
            id="reviewCount"
            name="reviewCount"
            value={form.reviewCount}
            onChange={changeHandler}
            placeholder="Enter review count"
            type="number"
            min="0"
            className={fieldClass}
          />
        </motion.div>

        <motion.div variants={cardVariants} whileHover={{ y: -3 }} className={cardClass}>
          <label htmlFor="badge" className={labelClass}>Badge</label>
          <input
            id="badge"
            name="badge"
            value={form.badge}
            onChange={changeHandler}
            placeholder="Example: New, Hot, Best Seller"
            className={fieldClass}
          />
        </motion.div>

        <motion.div variants={cardVariants} whileHover={{ y: -3 }} className={cardClass}>
          <label htmlFor="image" className={labelClass}>Medicine Image</label>
          <input
            ref={fileInputRef}
            id="image"
            type="file"
            name="image"
            accept="image/*"
            onChange={changeHandler}
            className={`${fieldClass} file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-100`}
          />
          <p className={hintClass}>Upload an image file for this medicine.</p>
        </motion.div>

        <motion.div variants={cardVariants} className="md:col-span-2">
          <div className={cardClass}>
            <label htmlFor="description" className={labelClass}>Description</label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={changeHandler}
              placeholder="Enter medicine description"
              className={`${fieldClass} min-h-30 resize-none`}
              rows="4"
            />
          </div>
        </motion.div>

        <motion.div variants={cardVariants} className="md:col-span-2">
          <div className={cardClass}>
            <label className={labelClass}>Prescription Required</label>
            <label className="inline-flex w-full cursor-pointer items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 transition-all duration-300 hover:border-blue-300 hover:bg-blue-50">
              <input
                type="checkbox"
                name="prescriptionRequired"
                checked={form.prescriptionRequired}
                onChange={changeHandler}
                className="h-4 w-4 shrink-0 accent-blue-600"
              />
              <span className="text-sm text-slate-700">
                Mark this medicine as prescription required
              </span>
            </label>
          </div>
        </motion.div>

        {(previewUrl || form.image) && (
          <motion.div
            variants={cardVariants}
            className="md:col-span-2"
            layout
          >
            <div className={cardClass}>
              <label className={labelClass}>Image Preview</label>

              <motion.div
                layout
                className={`overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 transition-all duration-200 ${
                  isRemovingImage ? "scale-95 opacity-0" : "scale-100 opacity-100"
                }`}
              >
                {previewUrl ? (
                  <motion.img
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    src={previewUrl}
                    alt="Medicine preview"
                    className="h-48 w-full object-cover transition-all duration-300 sm:h-56 md:h-64"
                  />
                ) : null}
              </motion.div>

              <div className="mt-4 flex flex-wrap gap-3">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={handleRemoveImage}
                  className="rounded-xl bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition-all duration-300 hover:bg-red-100"
                >
                  Remove Image
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        <motion.div variants={cardVariants} className="md:col-span-2 pt-2">
          <motion.button
            type="submit"
            whileHover={{ scale: submitting ? 1 : 1.02, y: submitting ? 0 : -2 }}
            whileTap={{ scale: submitting ? 1 : 0.98 }}
            disabled={submitting || loadingCategories || categories.length === 0}
            className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:bg-blue-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {submitting ? "Submitting..." : buttonText}
          </motion.button>
        </motion.div>
      </motion.div>
    </motion.form>
  );
};

export default MedicineForm;