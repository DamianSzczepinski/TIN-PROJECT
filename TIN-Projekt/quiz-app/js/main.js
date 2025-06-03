import { getResults } from './storage.js';

async function loadQuizzes() {
  const res = await fetch('./data/quizzes.json');
  if (!res.ok) return [];
  return await res.json();
}

function renderQuizzes(quizzes) {
  const list = document.getElementById('quiz-list');
  if (!quizzes.length) {
    list.innerHTML = '<p class="text-gray-500">Brak dostępnych quizów.</p>';
    return;
  }

  quizzes.forEach(q => {
    const wrap = document.createElement('div');
    wrap.className = 'bg-gradient-to-r from-indigo-500 to-pink-500 p-0.5 rounded-2xl hover:scale-105 transition-transform';

    const card = document.createElement('article');
    card.className = 'h-full p-6 rounded-[inherit] bg-white shadow hover:shadow-lg flex flex-col justify-between';

    const hist = getResults().filter(r=>r.quizId===q.id);
    const last = hist.at(-1);
    const pct = last ? Math.round((last.score/last.total)*100) : null;

    card.innerHTML = `
      <div>
        <h2 class="text-lg font-semibold mb-1">${q.title}</h2>
        <p class="text-sm text-gray-500 mb-4">${q.description}</p>
      </div>
      <div class="flex items-center justify-between">
        <span class="inline-block text-xs bg-gray-100 px-2 py-0.5 rounded-full">
          ${q.questionCount} pytań
        </span>
        ${pct!==null?`<span class="inline-block text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">Ostatni: ${pct}%</span>`:''}
      </div>`;

    card.onclick = ()=>location.href=`quiz.html?id=${encodeURIComponent(q.id)}`;
    wrap.appendChild(card); list.appendChild(wrap);
  });
}

loadQuizzes().then(renderQuizzes);