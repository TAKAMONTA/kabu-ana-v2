export const formatCurrency = (value: string | number): string => {
  // 既に通貨記号（$ または ￥）が含まれている場合は、そのまま表示
  if (typeof value === 'string') {
    // 既に通貨記号($ または ￥)が含まれている場合はそのまま返す
    if (/^[\s]*[\$￥]/.test(value)) {
      return value;
    }
  }

  const numValue = typeof value === 'string' ? parseFloat(value.replace(/[^\d.-]/g, '')) : value;
  if (isNaN(numValue)) return String(value);

  // 簡易ヒューリスティック: 1,000未満なら米ドルとみなす
  if (numValue < 1000) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(numValue);
  }

  // それ以外は円
  return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY', minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(numValue);
};

export const formatPercentage = (value: string | number): string => {
  const numValue = typeof value === 'string' ? parseFloat(value.replace(/[^\d.-]/g, '')) : value;
  if (isNaN(numValue)) return value.toString();
  
  return `${numValue > 0 ? '+' : ''}${numValue.toFixed(2)}%`;
};

export const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
