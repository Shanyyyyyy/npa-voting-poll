import { db, ref, onValue } from './firebase.js';

const officialResults = document.getElementById('officialResults');
const communityResults = document.getElementById('communityResults');
const communitySection = document.getElementById('communitySection');

const pollsRef = ref(db, 'votingPollSystem/polls');

// Kini ang basehan sa system kung unsa ang "Official" nga awards nato
const officialTitles = [
    "2026 Most Valuable Player", 
    "2026 Rookie of the Year", 
    "2026 Defensive Player of the Year", 
    "2026 Sixth Man of the Year", 
    "2026 Coach of the Year"
];

onValue(pollsRef, (snapshot) => {
    if (snapshot.exists()) {
        const allPolls = snapshot.val();
        renderResults(allPolls);
    } else {
        if (officialResults) {
            officialResults.innerHTML = "<p style='text-align:center;'>No votes have been cast yet.</p>";
        }
    }
});

function renderResults(allPolls) {
    if (!officialResults || !communityResults) return;
    
    // Limpyohan usa ang screen
    officialResults.innerHTML = "";
    communityResults.innerHTML = "";
    let hasCommunityBallots = false;

    for (let id in allPolls) {
        const poll = allPolls[id];
        if (!poll || !poll.question) continue;

        const card = document.createElement('div');
        card.className = "card poll-item";

        let optionsArray = [];
        let totalVotes = 0;
        for (let optKey in poll.options) {
            const opt = poll.options[optKey];
            optionsArray.push(opt);
            totalVotes += (opt.votes || 0);
        }
        
        // Sort from Rank 1 down to bottom
        optionsArray.sort((a, b) => (b.votes || 0) - (a.votes || 0));

        let optionsHtml = "";
        optionsArray.forEach(opt => {
            const votes = opt.votes || 0;
            const percentage = totalVotes === 0 ? 0 : Math.round((votes / totalVotes) * 100);
            
            optionsHtml += `
                <div style="margin: 15px 0;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                        <span style="font-weight: bold; color: white; font-size: 1.1rem;">${opt.text}</span>
                        <span style="color: var(--gold); font-weight: bold;">${votes} pts (${percentage}%)</span>
                    </div>
                    <div style="background: #222; border-radius: 4px; overflow: hidden; height: 12px;">
                        <div style="background: var(--gold); width: ${percentage}%; height: 100%; transition: width 0.5s ease-in-out;"></div>
                    </div>
                </div>
            `;
        });

        card.innerHTML = `
            <h3 style="margin-bottom: 15px; color: white; border-bottom: 1px solid #444; padding-bottom: 10px;">${poll.question}</h3>
            ${optionsHtml}
        `;

        // DIRI GI-BUWAG ANG OFFICIAL SA COMMUNITY
        if (officialTitles.includes(poll.question)) {
            officialResults.appendChild(card);
        } else {
            communityResults.appendChild(card);
            hasCommunityBallots = true; // Markahan nga naay community ballot nga nahimo
        }
    }

    // Kung walay custom ballot nga nahimo, tago-an ang "Community Ballots" nga title
    if (!hasCommunityBallots) {
        communitySection.style.display = 'none';
    } else {
        communitySection.style.display = 'block';
    }
}
