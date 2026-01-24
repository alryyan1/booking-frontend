// API Configuration Constants
// These constants define the base URL for API requests

// Schema (protocol)
export const API_SCHEMA = 'http';

// Domain
export const API_DOMAIN = 'localhost';

// Port (80 for Apache)
export const API_PORT = 80;

// Project folder in htdocs
export const PROJECT_FOLDER = 'booking-backend';

// Public directory
export const PUBLIC_DIR = 'public';

// API endpoint
export const API_ENDPOINT = 'api';

// Construct the full API base URL
// Format: schema://domain:port/project-folder/public/api
export const API_BASE_URL = `${API_SCHEMA}://${API_DOMAIN}${API_PORT !== 80 ? `:${API_PORT}` : ''}/${PROJECT_FOLDER}/${PUBLIC_DIR}/${API_ENDPOINT}`;

// Export individual parts for flexibility
export const config = {
  schema: API_SCHEMA,
  domain: API_DOMAIN,
  port: API_PORT,
  projectFolder: PROJECT_FOLDER,
  publicDir: PUBLIC_DIR,
  apiEndpoint: API_ENDPOINT,
  baseURL: API_BASE_URL,
};

export default config;
