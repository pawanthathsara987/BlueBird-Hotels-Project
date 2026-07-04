export const parseImageUrls = (imageUrlField) => {
  if (!imageUrlField) return [];
  try {
    const parsed = JSON.parse(imageUrlField);
    return Array.isArray(parsed) ? parsed : [imageUrlField];
  } catch {
    return [imageUrlField];
  }
};

export const formatPrice = (price) => {
  return parseFloat(price || 0).toLocaleString(undefined, { minimumFractionDigits: 2 });
};

export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const getCategoryStyle = (categoryName) => {
  const name = categoryName || "";
  if (name === "Clothes") return "bg-sky-50 text-sky-600 border-sky-100";
  if (name === "Accessories") return "bg-amber-50 text-amber-600 border-amber-100";
  
  // Custom hash-based colors for dynamic categories
  const colors = [
    "bg-purple-50 text-purple-600 border-purple-100",
    "bg-emerald-50 text-emerald-600 border-emerald-100",
    "bg-rose-50 text-rose-600 border-rose-100",
    "bg-pink-50 text-pink-600 border-pink-100",
    "bg-teal-50 text-teal-600 border-teal-100",
    "bg-indigo-50 text-indigo-600 border-indigo-100",
    "bg-orange-50 text-orange-600 border-orange-100"
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};
