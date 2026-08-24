const LOCAL_URL = "http://localhost:3000";

function withProtocol(value: string) {
  const trimmed = value.trim().replace(/\/+$/, "");
  if (!trimmed) return "";
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export function getSiteUrl() {
  const productionDomain = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (productionDomain) return withProtocol(productionDomain);

  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (configuredUrl) return withProtocol(configuredUrl);

  const deploymentDomain = process.env.VERCEL_URL;
  return deploymentDomain ? withProtocol(deploymentDomain) : LOCAL_URL;
}
