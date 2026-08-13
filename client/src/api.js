const API = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export const fetchSteps = () => request('/steps');
export const fetchFeatures = () => request('/features');
export const fetchOutfits = () => request('/outfits');
export const fetchStats = () => request('/stats');
export const fetchTestimonials = () => request('/testimonials');
export const sendChat = (message) =>
  request('/chat', { method: 'POST', body: JSON.stringify({ message }) });
export const subscribeNewsletter = (email) =>
  request('/newsletter', { method: 'POST', body: JSON.stringify({ email }) });
