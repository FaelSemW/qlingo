const API_BASE = '/api';

function getAuthHeader() {
  const token = localStorage.getItem('qlingo_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

export function getSavedUserProfile(email) {
  try {
    if (email) {
      const cleanEmail = email.trim().toLowerCase();
      const p = localStorage.getItem(`qlingo_profile_${cleanEmail}`);
      if (p) return JSON.parse(p);
    }
    const last = localStorage.getItem('qlingo_last_known_profile');
    if (last) return JSON.parse(last);
  } catch (e) {}
  return null;
}

export function saveAuth(token, user) {
  if (token) localStorage.setItem('qlingo_token', token);
  if (user) {
    localStorage.setItem('qlingo_user', JSON.stringify(user));
    if (user.email) {
      const cleanEmail = user.email.trim().toLowerCase();
      // Persistent permanent profile backup (survives clearAuth and backend redeploys!)
      localStorage.setItem(`qlingo_profile_${cleanEmail}`, JSON.stringify(user));
      localStorage.setItem('qlingo_last_known_profile', JSON.stringify(user));
    }
  }
}

export function getSavedUser() {
  const user = localStorage.getItem('qlingo_user');
  try {
    if (user) return JSON.parse(user);
    // Fallback to permanent profile if available
    const last = localStorage.getItem('qlingo_last_known_profile');
    return last ? JSON.parse(last) : null;
  } catch (e) {
    return null;
  }
}

export function clearAuth() {
  localStorage.removeItem('qlingo_token');
  localStorage.removeItem('qlingo_user');
  // Note: we intentionally PRESERVE qlingo_profile_<email> and qlingo_last_known_profile so students never lose their career/study goals
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

export async function loginWithFirebase({ email, name, avatar }) {
  const cleanEmail = (email || '').trim().toLowerCase();
  const savedProfile = getSavedUserProfile(cleanEmail);

  const payload = {
    email: cleanEmail,
    name: name || cleanEmail.split('@')[0],
    avatar,
    target_exam: savedProfile?.target_exam || null,
    study_goal: savedProfile?.study_goal || null,
    daily_goal: savedProfile?.daily_goal || 10,
    theme_preference: savedProfile?.theme_preference || 'dark'
  };

  const res = await fetch(`${API_BASE}/auth/firebase`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (data.token && data.user) {
    // If backend response is missing target_exam but local backup has it, merge seamlessly
    if (!data.user.target_exam && savedProfile?.target_exam) {
      data.user.target_exam = savedProfile.target_exam;
      data.user.study_goal = savedProfile.study_goal || data.user.study_goal;
    }
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

export async function generateCustomPracticeExam(config) {
  const res = await fetch(`${API_BASE}/ils/practice_tests/generate-custom`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    },
    body: JSON.stringify(config)
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

// ONBOARDING & ANALYTICS
export async function saveOnboardingProfile(profileData) {
  const curUser = getSavedUser() || {};
  const cleanEmail = (curUser.email || '').trim().toLowerCase();
  const merged = { ...curUser, ...profileData };

  // Save to persistent local storage immediately before network call
  if (cleanEmail) {
    localStorage.setItem(`qlingo_profile_${cleanEmail}`, JSON.stringify(merged));
  }
  localStorage.setItem('qlingo_last_known_profile', JSON.stringify(merged));
  saveAuth(localStorage.getItem('qlingo_token'), merged);

  const res = await fetch(`${API_BASE}/user_profile/onboarding`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    },
    body: JSON.stringify(profileData)
  });
  const data = await res.json();
  if (data.user) {
    saveAuth(localStorage.getItem('qlingo_token'), { ...merged, ...data.user });
  }
  return data;
}

export async function fetchAnalytics() {
  const res = await fetch(`${API_BASE}/user_profile/analytics`, {
    headers: { ...getAuthHeader() }
  });
  return res.json();
}

export async function fetchWeaknessQuestions(discipline) {
  const query = discipline ? `?discipline=${encodeURIComponent(discipline)}` : '';
  const res = await fetch(`${API_BASE}/user_profile/weakness_questions${query}`, {
    headers: { ...getAuthHeader() }
  });
  return res.json();
}

// IN-PROGRESS EXAMS (PAUSE & RESUME)
export async function pausePracticeTest(data) {
  const res = await fetch(`${API_BASE}/ils/practice_tests/attempts/pause`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function fetchInProgressExams() {
  const res = await fetch(`${API_BASE}/ils/practice_tests/attempts/in_progress`, {
    headers: { ...getAuthHeader() }
  });
  return res.json();
}

export async function discardInProgressExam(id) {
  const res = await fetch(`${API_BASE}/ils/practice_tests/attempts/${id}/discard`, {
    method: 'DELETE',
    headers: { ...getAuthHeader() }
  });
  return res.json();
}

export const api = {
  loginUser,
  registerUser,
  loginWithFirebase,
  fetchMe,
  getSavedUser,
  getSavedUserProfile,
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
  generateCustomPracticeExam,
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
      body: JSON.stringify({ answers, practice_test_id: attemptId })
    });
    return res.json();
  },
  pausePracticeTest,
  fetchInProgressExams,
  discardInProgressExam,
  saveOnboardingProfile,
  fetchAnalytics,
  fetchWeaknessQuestions,
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
