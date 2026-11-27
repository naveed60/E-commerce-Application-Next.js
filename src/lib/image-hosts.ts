// Keep rendering validation and Next's image optimizer on the same allowlist.
export const IMAGE_HOSTS = ["images.unsplash.com", "img.freepik.com", "www.bopuqilamur.org.uk", "nov-minicom.myshopify.com"];
export const IMAGE_HOST_SUFFIX = ".public.blob.vercel-storage.com";

export function isAllowedImageHost(hostname: string): boolean {
  return IMAGE_HOSTS.includes(hostname) || hostname.endsWith(IMAGE_HOST_SUFFIX);
}
