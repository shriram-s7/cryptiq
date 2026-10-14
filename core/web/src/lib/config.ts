function baseUrl(value: string | undefined, fallback: string): string {
  const url = new URL(value || fallback);
  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error('Service URLs must use HTTP or HTTPS.');
  }
  return url.href.replace(/\/$/, '');
}

export const config = {
  apiUrl: baseUrl(import.meta.env.VITE_CORE_API_URL, 'http://localhost:8000'),
  hubUrl: baseUrl(import.meta.env.VITE_HUB_WEB_URL, 'http://localhost:5174'),
};
