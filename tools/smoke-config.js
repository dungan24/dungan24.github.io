function resolveBaseUrl() {
  if (process.env.MP_BASE_URL) return process.env.MP_BASE_URL;
  if (process.env.PLAYWRIGHT_BASE_URL) return process.env.PLAYWRIGHT_BASE_URL;
  if (process.env.MP_DEFAULT_BASE_URL) return process.env.MP_DEFAULT_BASE_URL;
  return 'http://localhost:1314';
}

module.exports = {
  resolveBaseUrl
};
