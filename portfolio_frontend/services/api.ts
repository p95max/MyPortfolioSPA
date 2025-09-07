const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export async function fetchSomething() {
  const res = await fetch(`${API_URL}/api/some-endpoint/`);
  if (!res.ok) throw new Error("API error");
  return res.json();
}
