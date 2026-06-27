// Plain data types mirroring docs/architecture/data-model.md and the iOS/Android
// models. Only the subset the Home screen needs today; extend per later screen.

export type BrandColor =
  | "green"
  | "blue"
  | "yellow"
  | "teal"
  | "indigo"
  | "red"
  | "purple"
  | "cyan"
  | "orange"
  | "gray";

export const BRAND_HEX: Record<BrandColor, string> = {
  green: "#00C48C",
  blue: "#4A90E2",
  yellow: "#FFB800",
  teal: "#00D2D3",
  indigo: "#6C5CE7",
  red: "#FF4757",
  purple: "#A29BFE",
  cyan: "#22D3EE",
  orange: "#FF8A00",
  gray: "#8E8E93",
};

export interface TransferProvider {
  id: string;
  name: string;
  iconName: string;
  brandColor: BrandColor;
  trustScore: number;
  userRating: number;
  websiteURL: string;
  affiliateURL: string | null;
}

export type DeliveryEstimate =
  | "instant"
  | "minutes"
  | "hours"
  | "sameDay"
  | "nextDay"
  | "twoToThreeDays"
  | "threeToFiveDays";

export const DELIVERY_LABEL: Record<DeliveryEstimate, string> = {
  instant: "Instant",
  minutes: "Minutes",
  hours: "A few hours",
  sameDay: "Same day",
  nextDay: "Next day",
  twoToThreeDays: "2-3 days",
  threeToFiveDays: "3-5 days",
};

export interface TransferQuote {
  providerID: string;
  providerName: string;
  providerIcon: string;
  brandColor: BrandColor;
  sendAmount: number;
  sendCurrency: string;
  receiveCurrency: string;
  /** Effective EUR→PHP rate applied by this provider. */
  exchangeRate: number;
  fee: number;
  feeCurrency: string;
  receiveAmount: number;
  deliveryEstimate: DeliveryEstimate;
  markup: number;
  isPromotion: boolean;
  promotionText: string | null;
}

export interface Rate {
  base: string;
  quote: string;
  /** Mid-market rate. */
  rate: number;
  delta24h: number;
  delta7d: number;
  isStale: boolean;
  timestamp: number;
}

export interface HistoricalRate {
  date: number;
  rate: number;
}

export interface SponsoredOffer {
  providerName: string;
  providerIcon: string;
  brandColor: BrandColor;
  headline: string;
  description: string;
  ctaText: string;
  affiliateURL: string;
  discountPercentage: number | null;
}

export type TimeFrame = "24H" | "7D" | "30D" | "90D" | "1Y";

export const TIME_FRAMES: TimeFrame[] = ["24H", "7D", "30D", "90D", "1Y"];

export const TIMEFRAME_LOOKBACK_DAYS: Record<TimeFrame, number> = {
  "24H": 1,
  "7D": 7,
  "30D": 30,
  "90D": 90,
  "1Y": 365,
};

export type SortOption =
  | "recommended"
  | "highestPHP"
  | "lowestFee"
  | "fastest"
  | "bestRate";
