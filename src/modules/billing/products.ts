export interface Product {
  key: string;
  name: string;
  priceMinor: number;
  currency: string;
  entitlements: string[];
  durationDays?: number;
}

export const PRODUCTS: Record<string, Product> = {
  "track:java-backend-developer-to-cloud-engineer": {
    key: "track:java-backend-developer-to-cloud-engineer",
    name: "Java Backend Developer to Cloud Engineer Track",
    priceMinor: 299900,
    currency: "INR",
    entitlements: ["track:java-backend-developer-to-cloud-engineer"],
  },
  "track:java-backend-developer-to-ai-application-engineer": {
    key: "track:java-backend-developer-to-ai-application-engineer",
    name: "Java Backend Developer to AI Application Engineer Track",
    priceMinor: 299900,
    currency: "INR",
    entitlements: ["track:java-backend-developer-to-ai-application-engineer"],
  },
};

export function getProduct(key: string): Product | null {
  return PRODUCTS[key] ?? null;
}

export function getAllProducts(): Product[] {
  return Object.values(PRODUCTS);
}

export function hasEntitlementKey(key: string): boolean {
  return Object.values(PRODUCTS).some((product) =>
    product.entitlements.includes(key),
  );
}
