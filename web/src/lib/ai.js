export async function askCaAi({ input, token }) {
  const endpoint = import.meta.env.VITE_AI_ENDPOINT;
  if (!endpoint) throw new Error("Missing VITE_AI_ENDPOINT");

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ input }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error?.message || data?.error || `Request failed (${res.status})`);
  return data.text;
}
