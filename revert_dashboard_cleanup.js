const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'dashboard.html');
let content = fs.readFileSync(filePath, 'utf8');

// The replacement text string
const originalPropertyRender = '<div class="meta"><span><strong>Layout</strong>${p.bedrooms} beds / ${p.bathrooms} baths</span><span><strong>Size</strong>${p.sqft} sqft</span><span><strong>Price</strong>RM ${p.psf} psf</span></div><div class="reasons"><span><strong>Yield</strong>${p.yield}%</span><span><strong>Commute</strong>${p.commute}</span><span><strong>Offer</strong>${rmFull(decision.negotiation)}</span></div>';

// Using index of to catch the injected code regardless of regex
const hotBuyerMatch = '<div class="meta"><span><strong style="color:var(--brand-dark)"><i class="fas fa-fire"></i> Hot Buyer Score</strong>';
const endIndexMatch = '<b>Ready for follow-up</b></span></div>';

let startIdx = content.indexOf(hotBuyerMatch);
if (startIdx !== -1) {
    let endIdx = content.indexOf(endIndexMatch, startIdx);
    if (endIdx !== -1) {
        content = content.substring(0, startIdx) + originalPropertyRender + content.substring(endIdx + endIndexMatch.length);
    }
}

// 2. Deal Closer logic inside fillModal
const dealCloserMatch = 'const pScore = property.aiScore';
let dcStartIdx = content.indexOf(dealCloserMatch);
if (dcStartIdx !== -1) {
    let dcEndMatch = '$("leadFormWrap").classList.toggle("hidden",sessionRole!=="user");';
    let dcEndIdx = content.indexOf(dcEndMatch, dcStartIdx);
    if (dcEndIdx !== -1) {
        content = content.substring(0, dcStartIdx) + '$("leadFormWrap").classList.toggle("hidden",sessionRole!=="user");' + content.substring(dcEndIdx + dcEndMatch.length);
    }
}

// 3. Just in case AI Deal Closer HTML block is still there
const htmlBlock = '<div class="decision-card" id="modalDealCloser"';
let blockStartIdx = content.indexOf(htmlBlock);
if (blockStartIdx !== -1) {
    let blockEndMatch = 'Investor – Price Sensitive</b></span>\n</div>\n</div>';
    let blockEndIdx = content.indexOf(blockEndMatch, blockStartIdx);
    if (blockEndIdx !== -1) {
        content = content.substring(0, blockStartIdx) + content.substring(blockEndIdx + blockEndMatch.length);
    }
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully applied cleanup reversion.');
