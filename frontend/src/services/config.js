const normalizeBaseUrl = (value, fallback = '') => {
  if (!value || typeof value !== 'string') {
    return fallback;
  }

  return value
    .trim()
    .replace(/^['"`]+|['"`]+$/g, '')
    .replace(/^=+/, '')
    .replace(/\/+$/, '');
};

export const getApiBaseUrl = () => normalizeBaseUrl(process.env.REACT_APP_API_URL, 'http://localhost:5000');

export const getSocketBaseUrl = () => normalizeBaseUrl(process.env.REACT_APP_API_URL, window.location.origin);
