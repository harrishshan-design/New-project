const fs = require('fs');
const cp = require('child_process');

console.log("==> Reverting Dashboard to baseline");
cp.execSync('node revert_dashboard.js', {stdio: 'inherit'});

console.log("==> Restoring FOMO alerts & styles");
cp.execSync('node execute_addictive_ux.js', {stdio: 'inherit'});

console.log("==> Forcing Agent Super UI");
let ux3 = fs.readFileSync('execute_addictive_ux_3.js', 'utf8');
let html = fs.readFileSync('dashboard.html', 'utf8');
const agentCoreMatch = ux3.match(/const newAgentDashboardCore = \`([\s\S]*?)\`;/);
const agentCore = agentCoreMatch ? agentCoreMatch[1] : '';
const renderDopamineMatch = ux3.match(/const newRenderDopamine = \`([\s\S]*?)\`;/);
const renderDopamine = renderDopamineMatch ? renderDopamineMatch[1] : '';

html = html.replace(/<section class="agent-dashboard[^>]*id="agentSuperDashboard"[^>]*>[\s\S]*?<\/section>/, agentCore);

const jsInj = renderDopamine + '\nfunction hookDopamineToSystem() {\n  const orig = loadAgentInbox;\n  window.loadAgentInbox = async function() {\n    await orig.apply(this, arguments);\n    renderDopamineAgentDashboard();\n  }\n}\n';

if (html.includes('hookDopamineToSystem')) {
    html = html.replace(/\/\/ ==========================================\n\/\/ ADDICTIVE AGENT UI[\s\S]*?\}\n\}\n/, jsInj);
} else {
    html = html.replace('// Initialize', jsInj + '\n\n// Initialize');
}

fs.writeFileSync('dashboard.html', html, 'utf8');

console.log("==> Forcing User Smart Discovery");
cp.execSync('node execute_user_gaming.js', {stdio: 'inherit'});

console.log("==> Applying Psychological UX");
cp.execSync('node execute_psych_ux.js', {stdio: 'inherit'});

console.log("==> Applying Generative Premium Theme");
cp.execSync('node execute_generative_theme.js', {stdio: 'inherit'});

console.log("==> Injecting OpenAI Backend");
cp.execSync('node inject_openai_frontend.js', {stdio: 'inherit'});

console.log("ALL FEATURES RESTORED PERFECTLY!");
