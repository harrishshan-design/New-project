const fs = require('fs');
let content = fs.readFileSync('dashboard.html', 'utf8');

// 1. Inject HTML for Modal and ensure #aiCuratedHeader is wrapped.
const quizHtml = `
<!-- AI Match Quiz Modal -->
<div class="modal" id="aiQuizModal" style="z-index: 2000;">
    <div class="modal-card" style="max-width: 500px;">
        <div class="modal-header">
            <h3>AI Match Organizer <i class="fas fa-sparkles" style="color:var(--brand)"></i></h3>
            <button onclick="closeAIQuiz()"><i class="fas fa-times"></i></button>
        </div>
        <div class="modal-body" id="quizBody" style="min-height: 250px; display: flex; flex-direction: column; justify-content: center; position: relative; overflow: hidden; padding: 24px;">
            <div id="quizQ1" class="quiz-slide active">
                <h4>What is your primary goal today?</h4>
                <div class="quiz-opts">
                    <button class="quiz-btn" onclick="nextQuiz(1, 'Investment')">Investment & Yield</button>
                    <button class="quiz-btn" onclick="nextQuiz(1, 'First Home')">Buying First Home</button>
                    <button class="quiz-btn" onclick="nextQuiz(1, 'Upgrading')">Upgrading to Bigger Space</button>
                </div>
            </div>
            <div id="quizQ2" class="quiz-slide">
                <h4>What budget constraint feels safe?</h4>
                <div class="quiz-opts">
                    <button class="quiz-btn" onclick="nextQuiz(2, '< 500K')">Below RM 500K</button>
                    <button class="quiz-btn" onclick="nextQuiz(2, '500K-1M')">RM 500K - 1M</button>
                    <button class="quiz-btn" onclick="nextQuiz(2, '> 1M')">Above RM 1M</button>
                </div>
            </div>
            <div id="quizQ3" class="quiz-slide">
                <h4>What location vibe do you prefer?</h4>
                <div class="quiz-opts">
                    <button class="quiz-btn" onclick="nextQuiz(3, 'KL Lifestyle')">High Energy City Core</button>
                    <button class="quiz-btn" onclick="nextQuiz(3, 'Quiet Suburb')">Quiet Peaceful Suburb</button>
                    <button class="quiz-btn" onclick="nextQuiz(3, 'Transit Hub')">Next to MRT / Transit</button>
                </div>
            </div>
            <div id="quizQ4" class="quiz-slide">
                <h4>What is your absolute must-have?</h4>
                <div class="quiz-opts">
                    <button class="quiz-btn" onclick="nextQuiz(4, 'High Yield')">Strong Cashflow (ROI)</button>
                    <button class="quiz-btn" onclick="nextQuiz(4, 'Low Density')">Spacious / Low Density</button>
                    <button class="quiz-btn" onclick="nextQuiz(4, 'Brand New')">Brand New / Developer</button>
                </div>
            </div>
            <div id="quizQ5" class="quiz-slide">
                <h4>What is your timeline?</h4>
                <div class="quiz-opts">
                    <button class="quiz-btn" onclick="finishQuiz('ASAP')">Moving ASAP</button>
                    <button class="quiz-btn" onclick="finishQuiz('6 Months')">In 3-6 Months</button>
                    <button class="quiz-btn" onclick="finishQuiz('Browsing')">Just Browsing Markets</button>
                </div>
            </div>
            <div id="quizLoading" class="quiz-slide" style="text-align: center;">
                <i class="fas fa-brain fa-spin" style="font-size: 3rem; color: var(--brand); margin-bottom: 16px;"></i>
                <h4>Building your AI Profile...</h4>
                <p>Matching your style to the data grid.</p>
            </div>
        </div>
    </div>
</div>
`;

if(!content.includes('id="aiQuizModal"')) {
    content = content.replace('</body>', quizHtml + '\\n</body>');
}

const oldBannerHTML = `        <div>
            <span style="font-weight:700; color:var(--brand-dark); text-transform:uppercase; font-size:0.8rem; letter-spacing:0.04em;">Your AI Match 🎯</span>
            <h3 style="margin:8px 0; font-family:'Space Grotesk', sans-serif; font-size: 1.4rem;">Based on your taste…</h3>
            <p style="margin:0; font-weight:500; font-size:1.1rem; color: var(--ink); line-height: 1.5;">You prefer <strong style="color:var(--brand);">modern condos under RM500K</strong> near <strong style="color:var(--teal);">LRT stations</strong> with <strong style="color:var(--gold);">low density</strong>.</p>
            <p style="margin:6px 0 0; color: var(--muted); font-size: 0.95rem;">I've curated these exact matches for you today.</p>
        </div>`;

const newBannerHTML = `        <div id="aiCuratedHeader"></div>`;
if(content.includes(oldBannerHTML)) {
    content = content.replace(oldBannerHTML, newBannerHTML);
}

const cssOverrides = `
<style>
.quiz-slide { position: absolute; width: 100%; top: 0; left: 100%; opacity: 0; transition: 0.4s cubic-bezier(0.25, 1, 0.5, 1); padding: 12px; box-sizing: border-box; }
.quiz-slide.active { position: relative; left: 0; opacity: 1; }
.quiz-slide.past { left: -100%; opacity: 0; }
.quiz-slide h4 { font-size: 1.3rem; margin: 0 0 16px; color: var(--brand-dark); text-align: center; }
.quiz-opts { display: flex; flex-direction: column; gap: 10px; }
.quiz-btn { background: var(--bg); border: 1px solid var(--line); color: var(--ink); padding: 14px; border-radius: 12px; font-weight: 600; font-size: 1rem; cursor: pointer; transition: 0.2s; box-shadow: 0 2px 8px rgba(0,0,0,0.02); }
.quiz-btn:hover { background: var(--brand-soft); border-color: var(--brand); transform: translateY(-2px); box-shadow: 0 4px 12px rgba(187,77,45,0.1); }
.social-proof-pill { background: rgba(187,77,45,0.1); color: var(--brand-dark); font-size: 0.75rem; font-weight: 700; padding: 4px 10px; border-radius: 99px; display: inline-flex; align-items: center; gap: 4px; border: 1px solid rgba(187,77,45,0.2); }
.appreciation-pill { background: rgba(39, 174, 96, 0.1); color: #27ae60; font-size: 0.75rem; font-weight: 700; padding: 4px 10px; border-radius: 99px; display: inline-flex; align-items: center; gap: 4px; border: 1px solid rgba(39, 174, 96, 0.2); margin-left: 6px; }
</style>
`;
if(!content.includes('.quiz-slide {')) {
    content = content.replace('</style>', cssOverrides + '\\n</style>');
}

const jsLogic = `
// ==========================================
// 🧠 AI PROFILING & MATCH SYSTEM
// ==========================================
let aiProfile = JSON.parse(localStorage.getItem('ai_user_profile') || 'null');
let quizAnswers = [];

function openAIQuiz() {
    $("aiQuizModal").classList.add("open");
    quizAnswers = [];
    document.querySelectorAll('.quiz-slide').forEach(el => {
        el.classList.remove('active', 'past');
        el.style.display = '';
    });
    $("quizQ1").classList.add("active");
}

function closeAIQuiz() {
    $("aiQuizModal").classList.remove("open");
}

function nextQuiz(current, answer) {
    quizAnswers.push(answer);
    $("quizQ"+current).classList.remove("active");
    $("quizQ"+current).classList.add("past");
    $("quizQ"+(current+1)).classList.add("active");
}

function finishQuiz(answer) {
    quizAnswers.push(answer);
    $("quizQ5").classList.remove("active");
    $("quizQ5").classList.add("past");
    $("quizLoading").classList.add("active");
    
    setTimeout(() => {
        aiProfile = {
            intent: quizAnswers[0],
            budget: quizAnswers[1],
            locationVibe: quizAnswers[2],
            priority: quizAnswers[3],
            timeline: quizAnswers[4]
        };
        localStorage.setItem('ai_user_profile', JSON.stringify(aiProfile));
        closeAIQuiz();
        renderAIOrganizerView(); 
        renderProperties(); 
    }, 1500);
}

function renderAIOrganizerView() {
    const header = $("aiCuratedHeader");
    if(!header) return;
    
    if(!aiProfile) {
        header.innerHTML = '<span style="font-weight:700; color:var(--brand-dark); text-transform:uppercase; font-size:0.8rem; letter-spacing:0.04em;">Your AI Match 🎯</span>' +
            '<h3 style="margin:8px 0; font-family:\\'Space Grotesk\\', sans-serif; font-size: 1.4rem;">Unlock your perfect feed</h3>' +
            '<p style="margin:0; font-weight:500; font-size:1.1rem; color: var(--ink); line-height: 1.5;">Let the AI build your real estate profile. Tell us what you want in just 5 clicks.</p>' +
            '<button class="btn" style="margin-top: 14px;" onclick="openAIQuiz()">Build My Profile <i class="fas fa-arrow-right"></i></button>';
        $("aiCuratedGrid").innerHTML = "";
    } else {
        header.innerHTML = '<span style="font-weight:700; color:var(--brand-dark); text-transform:uppercase; font-size:0.8rem; letter-spacing:0.04em;">Your AI Match 🎯</span>' +
            '<h3 style="margin:8px 0; font-family:\\'Space Grotesk\\', sans-serif; font-size: 1.4rem;">Based on your smart profile…</h3>' +
            '<p style="margin:0; font-weight:500; font-size:1.1rem; color: var(--ink); line-height: 1.5;">You prefer <strong style="color:var(--brand);">' + aiProfile.budget + '</strong> properties near a <strong style="color:var(--teal);">' + aiProfile.locationVibe + '</strong> with <strong style="color:var(--gold);">' + aiProfile.priority + '</strong>.</p>' +
            '<p style="margin:6px 0 0; color: var(--muted); font-size: 0.95rem;">Because you are a <strong>' + aiProfile.intent + '</strong> moving in <strong>' + aiProfile.timeline + '</strong>, I\\'ve curated these exact matches.</p>' +
            '<button class="chip" style="margin-top: 12px; background: transparent; border: 1px solid var(--line); color: var(--muted);" onclick="openAIQuiz()">Retake Quiz</button>';
        
        // Ensure aiCuratedGrid exists and call render
        if(typeof renderAICurated === "function") renderAICurated();
    }
}
`;

if(!content.includes('function renderAIOrganizerView')) {
    content = content.replace('</script>', jsLogic + '\\n</script>');
}

// We safely build the replacement string for the tags
const newSubHtml = '<div style="margin-top:10px; margin-bottom:10px;"><span class="social-proof-pill"><i class="fas fa-users"></i> People like you viewed this more</span>${p.growth > 4.5 ? \\'<span class="appreciation-pill"><i class="fas fa-chart-line"></i> High appreciation area</span>\\' : \\'\\'}</div><p class="sub">${typeof aiProfile !== \\'undefined\\' && aiProfile ? \\'This condo fits your \\' + aiProfile.intent + \\' + \\' + aiProfile.locationVibe + \\' lifestyle profile.\\' : p.fit}</p>';

content = content.replace(/<p class="sub">\\$\\{p\\.fit\\}<\\/p>/g, newSubHtml);

if(content.includes('renderAICurated();')) {
    content = content.replace('renderAICurated();', 'renderAIOrganizerView();');
}

fs.writeFileSync('dashboard.html', content, 'utf8');
console.log('AI Profiling Quiz and Social Proof Hooks successfully injected!');
