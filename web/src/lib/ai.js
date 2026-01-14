function baseEndpoint() {
  const endpoint = import.meta.env.VITE_AI_ENDPOINT;
  if (!endpoint) throw new Error("Missing VITE_AI_ENDPOINT");
  return endpoint.endsWith("/") ? endpoint.slice(0, -1) : endpoint;
}

export async function askCaAi({ input, token, debug = false }) {
  const endpoint = baseEndpoint();

  const res = await fetch(debug ? `${endpoint}/?debug=1` : `${endpoint}/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ input, debug }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error?.message || data?.error || `Request failed (${res.status})`);

  // Return full payload so UI can access q_hash, citations, etc.
  return data;
}

export async function sendCaAiFeedback({ q_hash, helpful, token }) {
  const endpoint = baseEndpoint();

  const res = await fetch(`${endpoint}/feedback`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ q_hash, helpful }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error?.message || data?.error || `Feedback failed (${res.status})`);
  return data;
}
