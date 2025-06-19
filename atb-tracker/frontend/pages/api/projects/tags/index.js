export default async function handler(req, res) {
  const DJANGO_API_URL = process.env.DJANGO_API_URL || "http://localhost:8000";
  const url = `${DJANGO_API_URL}/api/projects/tags/`;

  const options = {
    method: req.method,
    headers: { "Content-Type": "application/json" },
  };
  if (req.method !== "GET") options.body = JSON.stringify(req.body);

  const response = await fetch(url, options);
  const data = await response.json();
  res.status(response.status).json(data);
} 