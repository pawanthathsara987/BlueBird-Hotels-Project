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
