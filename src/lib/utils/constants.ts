// Service locations
export const LOCATION_GROUPS = [
  {
    city: "台北市",
    districts: ["中正區", "大同區", "中山區", "松山區", "大安區", "萬華區", "信義區", "士林區", "北投區", "內湖區", "南港區", "文山區"]
  },
  {
    city: "新北市",
    districts: ["板橋區", "三重區", "中和區", "永和區", "新莊區", "新店區", "土城區", "蘆洲區", "汐止區", "樹林區", "三峽區", "淡水區", "林口區"]
  },
  {
    city: "桃園市",
    districts: ["桃園區", "中壢區", "平鎮區", "八德區", "楊梅區", "蘆竹區", "龜山區", "龍潭區"]
  },
  {
    city: "台中市",
    districts: ["中區", "東區", "南區", "西區", "北區", "北屯區", "西屯區", "南屯區", "太平區", "大里區", "豐原區"]
  },
  {
    city: "嘉義",
    districts: ["嘉義市", "太保市", "朴子市", "民雄鄉", "水上鄉", "中埔鄉"]
  },
  {
    city: "台南市",
    districts: ["中西區", "東區", "南區", "北區", "安平區", "安南區", "永康區", "歸仁區", "新營區"]
  },
  {
    city: "高雄市",
    districts: ["新興區", "前金區", "苓雅區", "鹽埕區", "鼓山區", "旗津區", "前鎮區", "三民區", "楠梓區", "小港區", "左營區", "鳳山區"]
  },
  {
    city: "其他",
    districts: ["到府服務", "店面服務"]
  }
];

export const LOCATIONS = LOCATION_GROUPS.flatMap(g =>
  g.city === "其他" ? g.districts : g.districts.map(d => `${g.city} ${d}`)
);

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
  { value: "other_nail", label: "其他", priceHint: "" },
] as const;

// Lash services
export const LASH_SERVICES = [
  { value: "natural_lash", label: "自然款嫁接", priceHint: "NT$800+" },
  { value: "volume_lash", label: "濃密款嫁接", priceHint: "NT$1200+" },
  { value: "camellia_lash", label: "山茶花嫁接", priceHint: "NT$1200+" },
  { value: "flat_lash", label: "扁毛嫁接", priceHint: "NT$1000+" },
  { value: "lower_lash", label: "下睫毛嫁接", priceHint: "NT$500+" },
  { value: "lash_lift", label: "角蛋白翹睫術", priceHint: "NT$800+" },
  { value: "lash_refill", label: "睫毛補接", priceHint: "NT$600+" },
  { value: "lash_removal", label: "卸除睫毛", priceHint: "" },
  { value: "other_lash", label: "其他", priceHint: "" },
] as const;

// Helper to check if selected services contain nail/lash
export function hasNailServices(services: string[]): boolean {
  return NAIL_SERVICES.some((s) => services.includes(s.label));
}
export function hasLashServices(services: string[]): boolean {
  return LASH_SERVICES.some((s) => services.includes(s.label));
}

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
  "卸除本店睫毛",
  "卸除他店睫毛",
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

// Payment methods
export const PAYMENT_METHODS = [
  "現金",
  "LINE Pay",
  "信用卡",
  "轉帳",
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
