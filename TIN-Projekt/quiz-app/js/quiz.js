import { saveResult } from './storage.js';

/* ─────────────────────────
   1) pobieramy identyfikator quizu z URL‑a,
      np.  /quiz.html?id=html-basics
   ───────────────────────── */
const params = new URLSearchParams(location.search);
const quizId = params.get('id');

if (!quizId) {
  alert('Brak parametru id w adresie URL');
  location.href = 'index.html';
}

/* ─────────────────────────
   2) ścieżki do plików z danymi
   ───────────────────────── */
const quizMetaUrl = './data/quizzes.json';
const questionsUrl = `./data/questions-${quizId}.json`;

/* ─────────────────────────
   3) stan aplikacji
   ───────────────────────── */
const state = {
  title: '',
  current: 0,
  correct: 0,
  questions: []
};

/* ─────────────────────────
   4) inicjalizacja
   ───────────────────────── */
init();

async function init() {
  try {
    /* meta ‑ tytuł quizu */
    const meta = await fetch(quizMetaUrl).then(r => r.json());
    const thisQuiz = meta.find(q => q.id === quizId);
    if (!thisQuiz) throw new Error('Nie znaleziono meta‑danych');
    state.title = thisQuiz.title;
    document.getElementById('quiz-title').textContent = state.title;

    /* pobieramy pytania */
    const qRes = await fetch(questionsUrl);
    if (!qRes.ok)
      throw new Error(`Brak pliku ${questionsUrl} (HTTP ${qRes.status})`);
    state.questions = await qRes.json();

    renderQuestion();
  } catch (err) {
    console.error(err);
    alert('Nie udało się wczytać quizu.');
    location.href = 'index.html';
  }
}

/* ─────────────────────────
   5) renderowanie pojedynczego pytania
   ───────────────────────── */
function renderQuestion() {
  const { current, questions } = state;
  const q = questions[current];

  /* progress (x / total) */
  document.getElementById('progress').textContent =
    `${current + 1} / ${questions.length}`;

  /* treść pytania */
  document.getElementById('question').textContent = q.text;

  /* odpowiedzi */
  const ul = document.getElementById('answers');
  ul.innerHTML = '';

  q.answers.forEach((ans, i) => {
    const li = document.createElement('li');

    const btn = document.createElement('button');
    btn.dataset.i = i;
    btn.className =
      'w-full text-left px-4 py-3 border rounded-lg bg-white hover:bg-gray-50 focus:outline-none focus:ring';

    /* Używamy textContent, aby wyświetlać dosłowny tekst (np. <ol>) */
    btn.textContent = ans;

    li.appendChild(btn);
    ul.appendChild(li);
  });
}

/* ─────────────────────────
   6) obsługa kliknięcia odpowiedzi
   ───────────────────────── */
document.getElementById('answers').addEventListener('click', e => {
  if (!e.target.matches('button[data-i]')) return;

  const choice = +e.target.dataset.i;
  const q = state.questions[state.current];

  if (choice === q.correct) state.correct++;

  state.current++;
  if (state.current < state.questions.length) {
    renderQuestion();
  } else {
    finishQuiz();
  }
});

/* ─────────────────────────
   7) zakończenie i przekierowanie na results.html
   ───────────────────────── */
function finishQuiz() {
  const { correct, questions } = state;
  saveResult(quizId, correct, questions.length);

  const query = new URLSearchParams({
    id: quizId,
    score: correct,
    total: questions.length
  }).toString();

  location.href = `results.html?${query}`;
}