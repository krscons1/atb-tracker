import getRawBody from 'raw-body';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  const { method } = req;
  
  // Get the token from the request headers
  const token = req.headers.authorization;
  
  // Set the Django API URL with fallback
  const DJANGO_API_URL = process.env.DJANGO_API_URL || 'http://localhost:8000';
  
  try {
    let response;
    
    if (method === 'GET') {
      // Fetch profile data
      response = await fetch(`${DJANGO_API_URL}/api/user-settings/profile/`, {
        method: 'GET',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json',
        },
      });
    } else if (method === 'PATCH') {
      // Update profile data
      // Detect if request is multipart/form-data
      const contentType = req.headers['content-type'] || req.headers['Content-Type'];
      let fetchOptions;
      if (contentType && contentType.includes('multipart/form-data')) {
        // Remove content-type header so fetch sets the correct boundary
        const headers = { 'Authorization': token };
        // Use raw-body to read the body
        const rawBody = await getRawBody(req);
        fetchOptions = {
          method: 'PATCH',
          headers,
          body: rawBody,
        };

      } else {
        // Default to JSON body
        fetchOptions = {
          method: 'PATCH',
          headers: {
            'Authorization': token,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(req.body),
        };
      }
      response = await fetch(`${DJANGO_API_URL}/api/user-settings/profile/`, fetchOptions);
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
    
    const data = await response.json();
    
    if (!response.ok) {
      return res.status(response.status).json(data);
    }
    
    return res.status(response.status).json(data);
  } catch (error) {
    console.error('Profile API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 