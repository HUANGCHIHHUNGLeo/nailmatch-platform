// Service locations
export const LOCATIONS = [
  "台北市",
  "新北市",
  "桃園",
  "台中",
  "高雄",
  "到府服務",
  "美甲店服務",
] as const;

// Nail services
export const NAIL_SERVICES = [
  { value: "single_gel", label: "單色凝膠", priceHint: "NT$600+" },
  { value: "cat_eye", label: "貓眼美甲", priceHint: "NT$800+" },
  { value: "french", label: "法式美甲", priceHint: "NT$800+" },
  { value: "extension", label: "延甲 / 接甲", priceHint: "NT$1500+" },
  { value: "hand_nail", label: "手部美甲", priceHint: "" },
  { value: "foot_nail", label: "足部美甲", priceHint: "" },
  { value: "hand_foot", label: "手足一起", priceHint: "" },
  { value: "removal", label: "卸甲", priceHint: "" },
  { value: "shape_care", label: "修型保養", priceHint: "" },
  { value: "custom_design", label: "客製款設計", priceHint: "NT$1200+" },
] as const;

// Nail length options
export const NAIL_LENGTHS = [
  "短甲",
  "中長甲",
  "長甲",
  "延甲需求",
] as const;

// Style preferences
export const STYLES = [
  "韓系清新",
  "日系可愛",
  "歐美個性",
  "氣質簡約",
  "高級質感",
  "立體裝飾",
  "網紅熱門款",
  "客製設計",
] as const;

// Schedule options
export const SCHEDULE_OPTIONS = [
  "今天",
  "明天",
  "本週",
  "其他日期",
] as const;

// Budget ranges
export const BUDGET_RANGES = [
  { value: "NT$500-800", label: "NT$500–800", description: "單色 / 基礎款" },
  { value: "NT$800-1200", label: "NT$800–1,200", description: "簡單設計" },
  { value: "NT$1200-2000", label: "NT$1,200–2,000", description: "設計款" },
  { value: "NT$2000-3500", label: "NT$2,000–3,500", description: "複雜設計" },
  { value: "NT$3500+", label: "NT$3,500+", description: "高級訂製" },
] as const;

// Removal options
export const REMOVAL_OPTIONS = [
  "不需要",
  "卸本店凝膠",
  "卸他店凝膠",
] as const;

// Gender options
export const GENDER_OPTIONS = [
  "女生",
  "男生",
  "不限",
] as const;

// Chat preference options
export const CHAT_PREFERENCES = [
  "不聊天",
  "可聊天",
] as const;

// Request status
export const REQUEST_STATUS = {
  pending: { label: "等待中", color: "bg-yellow-100 text-yellow-800" },
  matching: { label: "配對中", color: "bg-blue-100 text-blue-800" },
  matched: { label: "已配對", color: "bg-purple-100 text-purple-800" },
  confirmed: { label: "已確認", color: "bg-green-100 text-green-800" },
  completed: { label: "已完成", color: "bg-gray-100 text-gray-800" },
  cancelled: { label: "已取消", color: "bg-red-100 text-red-800" },
} as const;
