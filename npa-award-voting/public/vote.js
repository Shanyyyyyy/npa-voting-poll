// Function ni para sa boto-boto bay. Giusab nako ang local storage memory variables padulong npaVotes.
import { db, ref, onValue, update, push, set } from './firebase.js';

const pollContainer = document.getElementById('pollContainer');
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const statusFilter = document.getElementById('statusFilter');

let allPolls = {};
// Giusab ang keyword to npaVotes para di mabungkag imong karaan nga storage logic
let myVotes = JSON.parse(localStorage.getItem('npaVotes')) || {};

const pollsRef = ref(db, 'votingPollSystem/polls');

// Mu-listen sa database real-time
onValue(pollsRef, (snapshot) => {
    if (snapshot.exists()) {
        allPolls = snapshot.val();
        console.log("Firebase Data Loaded:", allPolls);
        renderPolls();
    } else {
        console.log("Firebase is completely empty.");
        if (pollContainer) {
            pollContainer.innerHTML = "<p style='text-align:center; color: #888; font-size: 1.2rem; margin-top: 20px;'>No ballots found in database.</p>";
        }
    }
});

function renderPolls() {
    if (!pollContainer) return;
    
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : "";
    const catValue = categoryFilter ? categoryFilter.value : "All";
    const statValue = statusFilter ? statusFilter.value : "All";

    pollContainer.innerHTML = "";
    let found = false;

    for (let id in allPolls) {
        const poll = allPolls[id];
        
        if (!poll || !poll.question) continue;

        const matchesSearch = poll.question.toLowerCase().includes(searchTerm);
        const matchesCat = catValue === "All" || poll.category === catValue;
        const matchesStat = statValue === "All" || poll.status === statValue;

        if (matchesSearch && matchesCat && matchesStat) {
            found = true;
            const card = document.createElement('div');
            card.className = "card poll-item";
            
            const hasVotedForThis = myVotes[id]; 

            let optionsHtml = "";
            for (let optKey in poll.options) {
                const isClosed = poll.status === "Closed";
                const isMyPick = myVotes[id] === optKey; 
                
                let btnStyle = isMyPick ? "background: var(--gold); color: black; border: 2px solid white;" : "";
                let btnText = isMyPick ? "✓ YOUR PICK" : "Vote (10pt)";
                
                optionsHtml += `
                    <div style="margin: 10px 0; display: flex; justify-content: space-between; align-items: center; padding: 10px; background: #222; border-radius: 6px; ${isMyPick ? 'border: 1px solid var(--gold);' : ''}">
                        <span style="font-weight: 600; ${isMyPick ? 'color: var(--gold);' : ''}">${poll.options[optKey].text}</span>
                        <div class="btn-group">
                            <button 
                                style="${btnStyle}"
                                ${isClosed || hasVotedForThis ? 'disabled' : ''} 
                                onclick="castVote('${id}', '${optKey}', 10)">
                                ${isClosed ? "CLOSED" : btnText}
                            </button>
                        </div>
                    </div>`;
            }

            card.innerHTML = `
                <div style="display:flex; justify-content:space-between; margin-bottom: 10px;">
                    <span class="status-badge ${poll.status.toLowerCase()}">${poll.status}</span>
                    <small style="color: var(--gold); font-weight: bold;">${hasVotedForThis ? "BALLOT CAST" : "PENDING"}</small>
                </div>
                <h3 style="margin-bottom: 15px;">${poll.question}</h3>
                ${optionsHtml}
            `;
            pollContainer.appendChild(card);
        }
    }

    if (!found) pollContainer.innerHTML = "<p style='text-align:center;'>No matching ballots found for your search/filter.</p>";
}

// System para ma-save ang gi-click nga player
window.castVote = (pollId, optKey, pts) => {
    const currentVotes = allPolls[pollId].options[optKey].votes || 0;
    update(ref(db, `votingPollSystem/polls/${pollId}/options/${optKey}`), { votes: currentVotes + pts });
    
    myVotes[pollId] = optKey;
    // I-save nako diri sa storage gamit na ang npaVotes
    localStorage.setItem('npaVotes', JSON.stringify(myVotes));
    
    const toast = document.createElement('div');
    toast.style.cssText = "position:fixed; bottom:20px; right:20px; background:var(--gold); color:#000; padding:15px; border-radius:8px; font-weight:bold; z-index:1000; box-shadow: 0 4px 15px rgba(0,0,0,0.5);";
    toast.innerText = `Ballot Locked! +${pts} Points`;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.remove(), 2000);
    renderPolls(); 
};

if(searchInput) searchInput.addEventListener('input', renderPolls);
if(categoryFilter) categoryFilter.addEventListener('change', renderPolls);
if(statusFilter) statusFilter.addEventListener('change', renderPolls);