export const formatPrice = (cents: number): string => {
  return (cents / 100).toFixed(2);
};

export const formatPriceWithSymbol = (cents: number): string => {
  return `¥${formatPrice(cents)}`;
};

export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

export const formatDateTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatNumber = (num: number): string => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
};

export const getStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    ACTIVE: 'text-success-500',
    PENDING: 'text-yellow-500',
    CANCELLED: 'text-red-500',
    EXPIRED: 'text-neutral-500',
    PAUSED: 'text-orange-500',
    SETTLED: 'text-success-500',
    WITHDRAWN: 'text-primary-500',
    SUCCESS: 'text-success-500',
    PROCESSING: 'text-primary-500',
    FAILED: 'text-red-500',
  };
  return colorMap[status] || 'text-neutral-500';
};

export const getStatusBg = (status: string): string => {
  const bgMap: Record<string, string> = {
    ACTIVE: 'bg-success-500',
    PENDING: 'bg-yellow-500',
    CANCELLED: 'bg-red-500',
    EXPIRED: 'bg-neutral-500',
    PAUSED: 'bg-orange-500',
    SETTLED: 'bg-success-500',
    WITHDRAWN: 'bg-primary-500',
    SUCCESS: 'bg-success-500',
    PROCESSING: 'bg-primary-500',
    FAILED: 'bg-red-500',
  };
  return bgMap[status] || 'bg-neutral-500';
};

export const getStatusText = (status: string): string => {
  const textMap: Record<string, string> = {
    ACTIVE: '活跃',
    PENDING: '待生效',
    CANCELLED: '已取消',
    EXPIRED: '已过期',
    PAUSED: '已暂停',
    SETTLED: '已结算',
    WITHDRAWN: '已提现',
    SUCCESS: '成功',
    PROCESSING: '处理中',
    FAILED: '失败',
  };
  return textMap[status] || status;
};
