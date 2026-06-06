const fs = require('fs');
let serverJs = fs.readFileSync('server.js', 'utf8');

const newsEndpointStr = `
        // ------------- LIVE PROPERTY NEWS AGENT -------------
        if (url === '/api/hotspots') {
            console.log("\\n🗞️ [NEWS API] Fetching live Google News for Malaysia Properties...");
            try {
                const rssUrl = "https://news.google.com/rss/search?q=malaysia+property&hl=en-MY&gl=MY&ceid=MY:en";
                // Node 18+ has native fetch
                const feedRes = await fetch(rssUrl, { headers: { 'User-Agent': 'KVAI-Backend/1.0' } });
                const xmlText = await feedRes.text();
                
                const items = [];
                const itemRegex = /<item>([\\s\\S]*?)<\\/item>/g;
                let match;
                while ((match = itemRegex.exec(xmlText)) !== null && items.length < 6) {
                    const block = match[1];
                    const titleMatch = block.match(/<title>([\\s\\S]*?)<\\/title>/);
                    const linkMatch = block.match(/<link>([\\s\\S]*?)<\\/link>/);
                    const pubDateMatch = block.match(/<pubDate>([\\s\\S]*?)<\\/pubDate>/);
                    
                    if (titleMatch && linkMatch) {
                        let titleText = titleMatch[1].replace(/<!\\[CDATA\\[(.*?)\\]\\]>/, '$1').replace(/ - .*$/, '').trim();
                        // Google news links are deeply nested now, but the standard <link> provides the redirect
                        items.push({
                            title: titleText,
                            link: linkMatch[1],
                            pubDate: pubDateMatch ? pubDateMatch[1] : new Date().toISOString(),
                            growth: "LIVE NEWS",
                            summary: "Breaking update from real estate markets."
                        });
                    }
                }
                return items.length > 0 ? items : { error: "No news found currently." };
            } catch (err) {
                console.error("RSS Fetch Error", err);
                return [
                   { title: "Market stabilized at 4.2% overnight yield drop.", growth: "LIVE NEWS", link: "#", summary: "Offline fallback." }
                ];
            }
        }
`;

if (!serverJs.includes('/api/hotspots')) {
    serverJs = serverJs.replace('// ------------- CONCIERGE CHAT AGENT -------------', newsEndpointStr + '\n        // ------------- CONCIERGE CHAT AGENT -------------');
    fs.writeFileSync('server.js', serverJs, 'utf8');
    console.log("Added News endpoint to server.js");
} else {
    console.log("Endpoint already exists.");
}
