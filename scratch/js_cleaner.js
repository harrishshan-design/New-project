const fs = require('fs');
const path = require('path');

function removeFunctions(srcStr, funcNames) {
    let result = srcStr;
    for (const name of funcNames) {
        // find function name(
        const regexStr = `function\\s+${name}\\s*\\(`;
        const regex = new RegExp(regexStr);
        const match = result.match(regex);
        
        if (!match) continue; // Function not found or already removed
        
        const startIdx = match.index;
        let braceCount = 0;
        let inFunc = false;
        let endIdx = startIdx;
        
        for (let i = startIdx; i < result.length; i++) {
            if (result[i] === '{') {
                braceCount++;
                inFunc = true;
            } else if (result[i] === '}') {
                braceCount--;
                if (inFunc && braceCount === 0) {
                    endIdx = i + 1;
                    break;
                }
            }
        }
        
        if (endIdx > startIdx) {
            console.log(`Removing function ${name} (Length: ${endIdx - startIdx})`);
            result = result.substring(0, startIdx) + result.substring(endIdx);
        }
    }
    return result;
}

const userToRemove = [
    'triggerSpeedFeedback', 'renderDopamineAgentDashboard', 'hookDopamineToSystem',
    'loadAgentDailyTools', 'regenerateAgentContent', 'loadAgentInbox', 
    'markTourStatus', 'respondToBooking', 'deleteDeal', 'counterOffer',
    'getAssignableAgents', 'getAgentPerformanceSnapshot', 'rankAgentsForOpportunity', 'getLeadIntelligence',
    'loadMasterExecutive', 'toggleMasterSection', 'loadChatLogs', 'loadRentalManagement',
    'executeRentalAction', 'saveListingEdits'
];

const agentToRemove = [
    'askAIFeed', 'runOnboarding', 'applyOnboarding', 'closeOnboarding', 
    'analyzeBehavioralProfile', 'triggerFomoUpdate',
    'loadMasterExecutive', 'toggleMasterSection', 'loadChatLogs', 'loadRentalManagement',
    'executeRentalAction', 'saveListingEdits', 'submitTenantApplication', 'submitRentPayment'
];

const masterToRemove = [
    'askAIFeed', 'runOnboarding', 'applyOnboarding', 'closeOnboarding', 
    'analyzeBehavioralProfile', 'triggerFomoUpdate',
    'triggerSpeedFeedback', 'renderDopamineAgentDashboard', 'hookDopamineToSystem',
    'loadAgentDailyTools', 'regenerateAgentContent', 'loadAgentInbox',
    'respondToBooking', 'submitTenantApplication', 'submitRentPayment', 'contactAgent', 'submitLeadContact'
];

function cleanFile(fileName, toRemove) {
    const filePath = path.join(__dirname, '../js', fileName);
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        console.log(`\n--- Cleaning ${fileName} ---`);
        content = removeFunctions(content, toRemove);
        fs.writeFileSync(filePath, content, 'utf8');
    } else {
        console.log(`File not found: ${filePath}`);
    }
}

cleanFile('user.js', userToRemove);
cleanFile('agent.js', agentToRemove);
cleanFile('master.js', masterToRemove);

console.log("\nCleanup Complete!");
