export function getRedirectPath(value: string | null): string {
  if (!value || /[\\\u0000-\u001f]/.test(value)) return "/";
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  if (typeof window !== "undefined") {
    try {
      const url = new URL(value);
      if (url.origin === window.location.origin) return `${url.pathname}${url.search}${url.hash}`;
    } catch {
      // Ignore invalid destinations.
    }
  }
  return "/";
}
