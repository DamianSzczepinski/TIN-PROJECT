/*  Prosty wrapper na localStorage  */

const KEY = 'quizResults';

export function saveResult(quizId, score, total) {
  const results = JSON.parse(localStorage.getItem(KEY) || '[]');
  results.push({ quizId, score, total, date: Date.now() });
  localStorage.setItem(KEY, JSON.stringify(results));
}

export function getResults() {
  return JSON.parse(localStorage.getItem(KEY) || '[]');
}