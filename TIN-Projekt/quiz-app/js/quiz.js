import { saveResult } from './storage.js';

function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}

const TIME_PER_QUESTION=20;
const FEEDBACK_DELAY=700;

const id=new URLSearchParams(location.search).get('id');
if(!id)location.href='index.html';

const metaURL='./data/quizzes.json';
const qURL=`./data/questions-${id}.json`;

const st={title:'',idx:0,ok:0,qs:[],rem:TIME_PER_QUESTION,tId:null};

init();

async function init(){
  const meta=await fetch(metaURL).then(r=>r.json());
  st.title=meta.find(q=>q.id===id)?.title||'Quiz';
  document.getElementById('quiz-title').textContent=st.title;

  document.getElementById('quiz-container').classList.add('transition-opacity','duration-300');

  const raw=await fetch(qURL).then(r=>r.json());
  st.qs=shuffle(raw).map(q=>{
    const ans=shuffle([...q.answers]);
    return{ text:q.text, answers:ans, correct:ans.indexOf(q.answers[q.correct]) };
  });
  render();
}

function render(){
  if(st.tId)clearInterval(st.tId);
  const cont=document.getElementById('quiz-container');
  cont.classList.add('opacity-0');
  requestAnimationFrame(()=>requestAnimationFrame(()=>cont.classList.remove('opacity-0')));

  st.rem=TIME_PER_QUESTION;
  const q=st.qs[st.idx];

  document.getElementById('progress-text').textContent=`${st.idx+1} / ${st.qs.length}`;
  document.getElementById('question').textContent=q.text;
  updateTimerUI();

  const ul=document.getElementById('answers'); ul.innerHTML='';
  q.answers.forEach((ans,i)=>{
    const b=document.createElement('button');
    b.dataset.i=i;
    b.className='w-full text-left px-4 py-3 border rounded-lg bg-white hover:bg-gray-50 transition transform';
    b.textContent=ans;
    ul.appendChild(b);
  });

  st.tId=setInterval(()=>{st.rem--; if(st.rem===0){clearInterval(st.tId);handle(-1);} updateTimerUI();},1000);
}

function updateTimerUI(){
  document.getElementById('timer').textContent=`${st.rem}s`;
  document.getElementById('time-bar').style.width=`${(st.rem/TIME_PER_QUESTION)*100}%`;
}

document.getElementById('answers').addEventListener('click',e=>{
  if(e.target.matches('button[data-i]'))handle(+e.target.dataset.i);
});

function handle(choice){
  if(st.tId)clearInterval(st.tId);

  const q=st.qs[st.idx];
  const btns=document.querySelectorAll('#answers button');
  const cont=document.getElementById('quiz-container');

  btns[q.correct].classList.add('bg-green-500','ring-4','ring-green-300','scale-105');

  if(choice!==q.correct&&choice!==-1){
    btns[choice].classList.add('bg-red-500','ring-4','ring-red-300','scale-105');
    cont.classList.add('shake');
  }

  btns.forEach(b=>b.classList.add('pointer-events-none'));

  setTimeout(()=>{
    cont.classList.remove('shake');
    if(choice===q.correct)st.ok++;
    st.idx++;
    st.idx<st.qs.length?render():finish();
  },FEEDBACK_DELAY);
}

function finish(){
  saveResult(id,st.ok,st.qs.length);
  const query=new URLSearchParams({id,score:st.ok,total:st.qs.length});
  location.href=`results.html?${query}`;
}