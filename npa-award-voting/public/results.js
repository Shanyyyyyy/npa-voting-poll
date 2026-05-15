// Mao ni nag update sa mga yellow bar real-time bay gikan sa database nato
import { db, ref, onValue } from './firebase.js';

const resultsContainer = document.getElementById('resultsContainer');

const pollsRef = ref(db, 'votingPollSystem/polls');

onValue(pollsRef, (snapshot) => {
    if (snapshot.exists()) {
        const allPolls = snapshot.val();
        renderResults(allPolls);
    } else {
        if (resultsContainer) {
            resultsContainer.innerHTML = "<p style='text-align:center;'>No votes have been cast yet.</p>";
        }
    }
});

// Function para pag layout sa mga player padulong rank 1, 2, 3
function renderResults(allPolls) {
    if (!resultsContainer) return;
    resultsContainer.innerHTML = "";

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
        
        // Paghan-ay (sort) kung kinsa ang pinakadaghan og boto
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
        resultsContainer.appendChild(card);
    }
}