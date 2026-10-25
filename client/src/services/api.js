const API_BASE = '/api';

function getAuthHeader() {
  const token = localStorage.getItem('qlingo_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

export function saveAuth(token, user) {
  if (token) localStorage.setItem('qlingo_token', token);
  if (user) localStorage.setItem('qlingo_user', JSON.stringify(user));
}

export function getSavedUser() {
  const user = localStorage.getItem('qlingo_user');
  try {
    return user ? JSON.parse(user) : null;
  } catch (e) {
    return null;
  }
}

export function clearAuth() {
  localStorage.removeItem('qlingo_token');
  localStorage.removeItem('qlingo_user');
}

// AUTH API
export async function loginUser(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (data.token && data.user) {
    saveAuth(data.token, data.user);
  }
  return data;
}

export async function registerUser(name, email, password) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
  });
  const data = await res.json();
  if (data.token && data.user) {
    saveAuth(data.token, data.user);
  }
  return data;
}

export async function fetchMe() {
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: { ...getAuthHeader() }
  });
  if (res.status === 401) {
    clearAuth();
    return null;
  }
  return res.json();
}

// QUESTIONS
export async function fetchQuestions(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') query.append(k, v);
  });
  const res = await fetch(`${API_BASE}/questions?${query.toString()}`, {
    headers: { ...getAuthHeader() }
  });
  return res.json();
}

export async function fetchDailyQuestions(career = 'all') {
  const res = await fetch(`${API_BASE}/questions/daily?career=${encodeURIComponent(career)}`, {
    headers: { ...getAuthHeader() }
  });
  return res.json();
}

export async function fetchQuestion(id) {
  const res = await fetch(`${API_BASE}/questions/${id}`, {
    headers: { ...getAuthHeader() }
  });
  return res.json();
}

export async function resolveQuestion(id, answer) {
  const res = await fetch(`${API_BASE}/questions/${id}/resolve`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    },
    body: JSON.stringify({ answer })
  });
  return res.json();
}

export async function addComment(id, text, user = 'Estudante QLingo') {
  const res = await fetch(`${API_BASE}/questions/${id}/commentaries`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    },
    body: JSON.stringify({ text, user })
  });
  return res.json();
}

export async function importQuestions(questions) {
  const res = await fetch(`${API_BASE}/questions/import`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    },
    body: JSON.stringify({ questions })
  });
  return res.json();
}

// PRACTICE TESTS
export async function fetchPracticeTests() {
  const res = await fetch(`${API_BASE}/ils/practice_tests`, {
    headers: { ...getAuthHeader() }
  });
  return res.json();
}

export async function fetchPracticeTest(id) {
  const res = await fetch(`${API_BASE}/ils/practice_tests/${id}`, {
    headers: { ...getAuthHeader() }
  });
  return res.json();
}

export async function createPracticeTest(data) {
  const res = await fetch(`${API_BASE}/ils/practice_tests/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function completePracticeTest(id, answers) {
  const res = await fetch(`${API_BASE}/ils/practice_tests/attempts/${id}/complete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    },
    body: JSON.stringify({ answers })
  });
  return res.json();
}

// STREAKS
export async function fetchStreaks() {
  const res = await fetch(`${API_BASE}/streaks`, {
    headers: { ...getAuthHeader() }
  });
  return res.json();
}

export async function updateDailyGoal(daily_goal) {
  const res = await fetch(`${API_BASE}/streaks/goal`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    },
    body: JSON.stringify({ daily_goal })
  });
  return res.json();
}

// FLASHCARDS
export async function fetchFlashcards(discipline) {
  const query = discipline ? `?discipline=${encodeURIComponent(discipline)}` : '';
  const res = await fetch(`${API_BASE}/mobile/v1/flashcards/deck${query}`, {
    headers: { ...getAuthHeader() }
  });
  return res.json();
}

export async function answerFlashcard(id, rating) {
  const res = await fetch(`${API_BASE}/mobile/v1/flashcards/answers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    },
    body: JSON.stringify({ id, rating })
  });
  return res.json();
}

export async function createFlashcard(data) {
  const res = await fetch(`${API_BASE}/mobile/v1/flashcards/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    },
    body: JSON.stringify(data)
  });
  return res.json();
}

// NOTEBOOKS
export async function fetchNotebooks() {
  const res = await fetch(`${API_BASE}/mobile/notebooks`, {
    headers: { ...getAuthHeader() }
  });
  return res.json();
}

export async function fetchNotebook(id) {
  const res = await fetch(`${API_BASE}/mobile/notebooks/${id}`, {
    headers: { ...getAuthHeader() }
  });
  return res.json();
}

export async function createNotebook(name, color) {
  const res = await fetch(`${API_BASE}/mobile/notebooks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    },
    body: JSON.stringify({ name, color })
  });
  return res.json();
}

export async function toggleNotebookQuestion(notebookId, questionId) {
  const res = await fetch(`${API_BASE}/mobile/notebooks/${notebookId}/toggle_question`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    },
    body: JSON.stringify({ question_id: questionId })
  });
  return res.json();
}

export async function fetchCatalogProvas(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/concursos/catalogo?${query}`);
  return res.json();
}

export async function fetchCatalogStats() {
  const res = await fetch(`${API_BASE}/concursos/catalogo/stats`);
  return res.json();
}

export async function fetchWeeklyErrors() {
  const res = await fetch(`${API_BASE}/mobile/notebooks/weekly_errors`, {
    headers: { ...getAuthHeader() }
  });
  return res.json();
}

export async function fetchUserProfile() {
  const res = await fetch(`${API_BASE}/user_profile/profile`, {
    headers: { ...getAuthHeader() }
  });
  return res.json();
}

export async function fetchPerformance() {
  const res = await fetch(`${API_BASE}/performance`, {
    headers: { ...getAuthHeader() }
  });
  return res.json();
}

export async function checkLimits() {
  const res = await fetch(`${API_BASE}/check_limits_app`, {
    headers: { ...getAuthHeader() }
  });
  return res.json();
}

// Unified API Object Export
export const api = {
  loginUser,
  registerUser,
  fetchMe,
  getSavedUser,
  saveAuth,
  clearAuth,
  fetchQuestions,
  fetchDailyQuestions,
  getDailyQuestions: fetchDailyQuestions,
  fetchQuestion,
  resolveQuestion,
  addComment,
  importQuestions,
  fetchPracticeTests,
  getPracticeTests: fetchPracticeTests,
  fetchPracticeTest,
  getPracticeTestQuestions: fetchPracticeTest,
  createPracticeTest,
  completePracticeTest,
  startPracticeTestAttempt: async (testId) => ({ attempt_id: testId }),
  updatePracticeTestAnswer: async (attemptId, questionId, answer) => {
    const res = await fetch(`${API_BASE}/ils/practice_tests/attempts/${attemptId}/questions/${questionId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify({ answer })
    });
    return res.json();
  },
  completePracticeTestAttempt: async (attemptId, answers) => {
    const res = await fetch(`${API_BASE}/ils/practice_tests/attempts/${attemptId}/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify({ answers })
    });
    return res.json();
  },
  fetchStreaks,
  updateDailyGoal,
  fetchFlashcards,
  answerFlashcard,
  createFlashcard,
  fetchNotebooks,
  fetchNotebook,
  createNotebook,
  toggleNotebookQuestion,
  fetchWeeklyErrors,
  fetchUserProfile,
  fetchPerformance,
  checkLimits,
  fetchCatalogProvas,
  fetchCatalogStats
};

export default api;
