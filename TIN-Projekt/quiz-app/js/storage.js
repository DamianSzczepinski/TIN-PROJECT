const KEY = 'quizResults';

export function saveResult(quizId, score, total) {
  const arr = JSON.parse(localStorage.getItem(KEY) || '[]');
  arr.push({ quizId, score, total, date: Date.now() });
  localStorage.setItem(KEY, JSON.stringify(arr));
}

export function getResults() {
  return JSON.parse(localStorage.getItem(KEY) || '[]');
}