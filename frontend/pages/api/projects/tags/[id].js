export default async function handler(req, res) {
  const { id } = req.query;
  const DJANGO_API_URL = process.env.DJANGO_API_URL || "http://localhost:8000";
  const url = `${DJANGO_API_URL}/api/projects/tags/${id}/`;

  const options = {
    method: req.method,
    headers: { "Content-Type": "application/json" },
  };
  if (req.method === "PUT" || req.method === "PATCH") options.body = JSON.stringify(req.body);

  const response = await fetch(url, options);
  if (response.status !== 204) {
    const data = await response.json();
    res.status(response.status).json(data);
  } else {
    res.status(204).end();
  }
} 