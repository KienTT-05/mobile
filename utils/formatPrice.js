export const formatPrice = (price) => {
  if (price === 0 || price == null) return 'Miễn phí';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price);
};

export const effectivePrice = (price, discountPrice) => {
  return discountPrice != null ? discountPrice : price;
};
