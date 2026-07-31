const garData={
  green:{title:'Green',tagline:'Generally acceptable',items:[
    'Generate search terms, then find and read the original sources.',
    'Use AI summaries to help understand a source, then verify the source yourself.',
    'Identify alternative viewpoints, then investigate and evaluate them.',
    'Use basic spelling or grammar tools where permitted by the subject.',
    'Keep drafts, notes, version history and records of permitted AI use.'
  ]},
  amber:{title:'Amber',tagline:'Ask first',items:[
    'Generate or refine a research question.',
    'Ask AI to comment on or grade a formal IB assessment draft.',
    'Create an outline or structure for assessed work.',
    'Upload assessed drafts, teacher feedback, personal data or school documents.',
    'Use translation or language-support tools in assessed work, especially in language acquisition.'
  ]},
  red:{title:'Red',tagline:'Not acceptable',items:[
    'Submit AI-generated text, images, code, data, analysis or ideas as your own.',
    'Hide AI use or make a false declaration.',
    'Use AI to rewrite or materially reshape assessed work.',
    'Generate personal reflections, conclusions or evaluations that should be your own.',
    'Use or cite references that you have not opened, read and verified.'
  ]}
};
function showGAR(key,el){document.querySelectorAll('.gar-card').forEach(c=>c.classList.remove('selected'));if(el)el.classList.add('selected');const d=garData[key];document.getElementById('garPanel').innerHTML=`<h3>${d.title}</h3><p class="tagline">${d.tagline}</p><ul>${d.items.map(x=>`<li>${x}</li>`).join('')}</ul>`}
const decisions={
1:{title:'AI summarizes key points and suggests references',tag:'Acceptable',cls:'accept',r:'Acceptable if the student understands the points, verifies sources and writes in their own words.'},
2:{title:'AI identifies counterarguments or alternative viewpoints',tag:'Acceptable',cls:'accept',r:'Acceptable when used to broaden thinking and followed by genuine investigation.'},
3:{title:'AI finds quotations copied without checking',tag:'Not acceptable',cls:'no',r:'The student must read and engage with original sources, not copy AI-found quotes.'},
4:{title:'AI develops the research question',tag:'Not acceptable',cls:'no',r:'The final research question should arise from the student’s own inquiry and teacher-approved process.'},
5:{title:'AI writes a complete model essay',tag:'Context, generally not acceptable',cls:'context',r:'It risks replacing the student’s ideas. A viva or oral quiz may test understanding, but misuse can become plagiarism.'},
6:{title:'AI generates model paragraphs',tag:'Context, generally acceptable',cls:'context',r:'It depends whether AI replaced thinking or served as a reference; the final analysis must be the student’s own.'},
7:{title:'AI rewrites the completed essay',tag:'Generally not acceptable, nuanced',cls:'context',r:'For IB assessment, students should submit original work. Teachers may use judgment in non-assessment contexts.'},
8:{title:'AI translates work into submission language',tag:'Not acceptable for IB assessment',cls:'no',r:'IB certification assumes the student can work in the submission language.'},
9:{title:'AI suggests grammar and sentence improvements',tag:'Context, generally acceptable',cls:'context',r:'Generally acceptable unless language quality is being assessed or coherence/argument is materially reshaped.'},
10:{title:'AI marks work and gives improvement feedback',tag:'Not acceptable for IB assessment; possible elsewhere',cls:'context',r:'For IB assessments this may conflict with feedback limits; outside assessment it can be educationally useful.'},
11:{title:'AI writes a personal reflection',tag:'Not acceptable',cls:'no',r:'Reflection must represent the student’s own evaluation of learning and process.'},
12:{title:'Student conceals AI use',tag:'Not acceptable',cls:'no',r:'Transparency is required even when the underlying AI use might have been acceptable.'},
13:{title:'AI generates an essay structure or template',tag:'Context, generally acceptable',cls:'context',r:'Comparable to using exemplars or textbooks for a framework if acknowledged and the content remains the student’s own.'}
};
let current=0;const slides=[...document.querySelectorAll('.slide')];function show(i){current=Math.max(0,Math.min(i,slides.length-1));slides.forEach((s,idx)=>s.classList.toggle('active',idx===current));document.getElementById('progress').style.width=((current+1)/slides.length*100)+'%'}function nextSlide(){show(current+1)}function prevSlide(){show(current-1)}document.addEventListener('keydown',e=>{if(['ArrowRight','PageDown',' '].includes(e.key)){e.preventDefault();nextSlide()}if(['ArrowLeft','PageUp'].includes(e.key)){e.preventDefault();prevSlide()}});
function fillSelect(id){const sel=document.getElementById(id);for(let i=1;i<=13;i++){const opt=document.createElement('option');opt.value=i;opt.textContent=`Scenario ${i}`;sel.appendChild(opt)}}['g1','g2','g3','g4'].forEach(fillSelect);
function resultHTML(group,num){const d=decisions[num];return `<div class="result-card"><h3>${group}: Scenario ${num}</h3><p class="scenario-title">${d.title}</p><span class="tag ${d.cls}">${d.tag}</span><p>${d.r}</p></div>`}
function revealAllGroups(){const ids=['g1','g2','g3','g4'];document.getElementById('groupResults').innerHTML=ids.map((id,idx)=>resultHTML(`Group ${idx+1}`,document.getElementById(id).value)).join('')}
function renderIB(num){document.querySelectorAll('.ib-btn').forEach(b=>b.classList.toggle('active',b.dataset.num==num));const d=decisions[num];document.getElementById('ibDetail').innerHTML=`<span class="tag ${d.cls}">${d.tag}</span><h3>Scenario ${num}: ${d.title}</h3><p>${d.r}</p>`}
const grid=document.getElementById('ibGrid');for(let i=1;i<=13;i++){const b=document.createElement('button');b.className='ib-btn';b.dataset.num=i;b.textContent=i;b.onclick=()=>renderIB(i);grid.appendChild(b)}
showGAR('green');show(0);
