import { getResults } from './storage.js';

async function loadQuizzes() {
  try {
    const res = await fetch('./data/quizzes.json');
    if (!res.ok) throw new Error(res.status);
    return await res.json();
  } catch (err) {
    console.error('Błąd pobierania listy quizów:', err);
    return [];
  }
}

function renderQuizzes(quizzes) {
  const list = document.getElementById('quiz-list');
  if (!quizzes.length) {
    list.innerHTML =
      '<p class="text-gray-500">Brak dostępnych quizów.</p>';
    return;
  }

  quizzes.forEach((q) => {
    const card = document.createElement('article');
    card.className =
      'p-6 rounded-xl border shadow-sm bg-white hover:shadow-md transition cursor-pointer';

    const hist = getResults().filter(r => r.quizId === q.id);
    const last = hist.at(-1);
    const pct  = last ? Math.round((last.score / last.total) * 100) : null;

    card.innerHTML = `
      <h2 class="text-lg font-semibold mb-1">${q.title}</h2>
      <p class="text-sm text-gray-500 mb-3">${q.description}</p>
      <div class="flex items-center justify-between">
        <span class="inline-block text-xs bg-gray-100 px-2 py-0.5 rounded-full">
          ${q.questionCount} pytań
        </span>
        ${pct !== null ? `
          <span class="inline-block text-xs bg-blue-100 text-blue-800
                       px-2 py-0.5 rounded-full">
            Ostatni: ${pct}%
          </span>` : ''}
      </div>`;

    card.onclick = () =>
      (location.href = `quiz.html?id=${encodeURIComponent(q.id)}`);

    list.appendChild(card);
  });
}

loadQuizzes().then(renderQuizzes);