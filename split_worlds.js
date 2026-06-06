const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const html = fs.readFileSync('dashboard.html', 'utf8');

function extractWorld(role) {
    const dom = new JSDOM(html);
    const document = dom.window.document;

    // Remove the global role select UI
    const roleSelect = document.getElementById('roleSelect');
    if (roleSelect && roleSelect.parentElement) {
        roleSelect.parentElement.remove();
    }
    const applyRoleBtn = document.getElementById('applyRoleBtn');
    if (applyRoleBtn) applyRoleBtn.remove();
    const roleName = document.getElementById('roleName');
    if (roleName) roleName.remove();
    
    // Remove roles specific logic from DOM
    if (role === 'user') {
        document.querySelectorAll('.agent-only, .master-only, #agentSuperDashboard, #masterPanel').forEach(el => el.remove());
    } else if (role === 'agent') {
        document.querySelectorAll('.user-only, .master-only, #discover, #masterPanel, #onboardingSection, .hero, .hero-side, .hero-copy').forEach(el => el.remove());
    } else if (role === 'master') {
        document.querySelectorAll('.user-only, .agent-only, #discover, #agentSuperDashboard, #onboardingSection, .hero, .hero-side, .hero-copy').forEach(el => el.remove());
    }

    // Now deal with the JS variables at the bottom
    let outHtml = dom.serialize();
    
    // Hardcode sessionRole and remove dynamic role loading
    outHtml = outHtml.replace(/(?:let|const)\s+sessionRole\s*=\s*localStorage\.getItem\((['"])kvai_role\1\)(?:\s*\|\|\s*(['"])[^'"]+\2\s*)?;?/gi, `const sessionRole = "${role}";`);
    outHtml = outHtml.replace(/(?:let|const)\s+activeRole\s*=\s*localStorage\.getItem\((['"])kvai_role\1\);?/gi, `const activeRole = "${role}";`);
    
    // Let's strip the apply role button logic just in case it throws an error
    outHtml = outHtml.replace(/if\s*\(\$\("applyRoleBtn"\)\)\s*\{[\s\S]*?\$\("applyRoleBtn"\)\.addEventListener[\s\S]*?\}\s*\}/, '');

    // Write file
    let filename = '';
    if (role === 'user') filename = 'user_dashboard.html';
    if (role === 'agent') filename = 'agent_dashboard.html';
    if (role === 'master') filename = 'master_dashboard.html';
    
    fs.writeFileSync(filename, outHtml, 'utf8');
    console.log(`Generated ${filename}`);
}

extractWorld('user');
extractWorld('agent');
extractWorld('master');
