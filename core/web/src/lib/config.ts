function baseUrl(value: string | undefined, fallback: string): string {
  const url = new URL(value || fallback);
  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error('Service URLs must use HTTP or HTTPS.');
  }
  return url.href.replace(/\/$/, '');
}

const hosted = !['localhost', '127.0.0.1'].includes(window.location.hostname) || window.location.port === '8000';
export const config = {
  hosted,
  shopUrl: hosted ? `${window.location.origin}/shop` : 'http://localhost:5050',
  useMocks: import.meta.env.VITE_USE_MOCKS === 'true',
  apiUrl: hosted ? window.location.origin : baseUrl(import.meta.env.VITE_CORE_API_URL, 'http://localhost:8000'),
  hubUrl: hosted ? window.location.origin : baseUrl(import.meta.env.VITE_HUB_WEB_URL, 'http://localhost:5174'),
};
