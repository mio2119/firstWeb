const DETAIL_PROVINCE_CODES = new Set(['gd']);

export const hasProvinceDetailData = (provinceCode?: string | null) => (
  Boolean(provinceCode && DETAIL_PROVINCE_CODES.has(provinceCode))
);
