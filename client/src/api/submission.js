import { http } from './http.js';

// Get the logged-in team's game submission
export async function getSubmission() {
  const response = await http.get('/team/submission');
  return response.data;
}

// Save or update the team's game submission
export async function saveSubmission(submissionData) {
  const response = await http.put('/team/submission', submissionData);
  return response.data;
}