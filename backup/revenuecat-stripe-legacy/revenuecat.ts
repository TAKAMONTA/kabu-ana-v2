import { Purchases } from "@revenuecat/web-sdk";

// Singleton initializer for RevenueCat Web SDK
// Must be imported once at app startup (e.g. in index.tsx or App.tsx)
// The public key is provided via NEXT_PUBLIC_REVENUECAT_PUBLIC_KEY at build time.

// Using process.env because esbuild replaces during bundling
const PUBLIC_KEY = process.env.NEXT_PUBLIC_REVENUECAT_PUBLIC_KEY as string | undefined;

if (!PUBLIC_KEY) {
  console.warn("RevenueCat public key is missing. Set NEXT_PUBLIC_REVENUECAT_PUBLIC_KEY in .env.local");
} else {
  // Initialize only once
  try {
    Purchases.init(PUBLIC_KEY);
    console.log("RevenueCat Web SDK initialised");
  } catch (e) {
    console.error("Failed to initialise RevenueCat Web SDK", e);
  }
}

export default Purchases;

// Helper to purchase by package identifier (within current offering)
export async function purchasePlanByIdentifier(pkgId: string) {
  const offerings = await Purchases.getOfferings();
  const current = offerings.current;
  if (!current) throw new Error('オファリング情報が取得できません');
  const pkg = current.availablePackages.find(p => p.identifier === pkgId);
  if (!pkg) throw new Error(`パッケージ ${pkgId} が見つかりません`);
  return Purchases.purchasePackage(pkg);
}

// Map RevenueCat CustomerInfo to planId (assumes identifier === planId)
export async function getActivePlanId(): Promise<string | null> {
  const info = await Purchases.getCustomerInfo();
  const active = info.activeSubscriptions?.[0];
  return active || null;
}

// Purchase specifying both offeringId and package identifier (e.g. $rc_monthly)
export async function purchasePlanFromOffering(offeringId: string, packageId: string) {
  const offerings = await Purchases.getOfferings();
  const offering = offerings.all?.[offeringId];
  if (!offering) throw new Error(`Offering '${offeringId}' が取得できません`);
  const pkg = offering.availablePackages.find(p => p.identifier === packageId);
  if (!pkg) throw new Error(`Package '${packageId}' が見つかりません`);
  return Purchases.purchasePackage(pkg);
}
