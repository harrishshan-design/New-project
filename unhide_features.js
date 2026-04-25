const fs = require('fs');
const content = fs.readFileSync('dashboard.html', 'utf8');

// The CSS line that hides the things
const hidePattern = '.admin-panel,.agent-only,.chat-only,.admin-only,.staff-only,.user-only{display:none}';
const showPattern = '/* Role hiding disabled by user request */\\n/* .admin-panel,.agent-only,.chat-only,.admin-only,.staff-only,.user-only{display:none} */\\n.admin-panel,.agent-only,.chat-only,.admin-only,.staff-only,.user-only{display:block;}';

let newContent = content.replace(hidePattern, showPattern);

// Also remove the "display:none" from #modalEditWrap
newContent = newContent.replace('body:not(.master) #modalEditWrap{display:none}', '/* body:not(.master) #modalEditWrap{display:none} */');

fs.writeFileSync('dashboard.html', newContent, 'utf8');
console.log('Successfully made all features visible again!');
