import { getCurrentUserToken } from '../firebase/auth';

// Base URL for your API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Helper function to get headers with authentication token
async function getAuthHeaders() {
  const token = await getCurrentUserToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
}

// Generic fetch function with authentication
export async function fetchWithAuth(endpoint, options = {}) {
  const headers = await getAuthHeaders();
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });

  // Handle 401 Unauthorized errors (token expired or invalid)
  if (response.status === 401) {
    // You could implement token refresh logic here if needed
    throw new Error('Authentication failed. Please log in again.');
  }

  // Handle other errors
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'An error occurred');
  }

  return response.json();
}

// GET request
export async function get(endpoint) {
  return fetchWithAuth(endpoint, {
    method: 'GET',
  });
}

// POST request
export async function post(endpoint, data) {
  return fetchWithAuth(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// PUT request
export async function put(endpoint, data) {
  return fetchWithAuth(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// DELETE request
export async function del(endpoint) {
  return fetchWithAuth(endpoint, {
    method: 'DELETE',
  });
}

// PATCH request
export async function patch(endpoint, data) {
  return fetchWithAuth(endpoint, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
} 