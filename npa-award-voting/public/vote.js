import { db, ref, onValue, update } from './firebase.js';

const pollContainer = document.getElementById('pollContainer');
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const statusFilter = document.getElementById('statusFilter');
const submitBar = document.getElementById('submitBar');
const submitAllBtn = document.getElementById('submitAllBtn');
const pendingCountText = document.getElementById('pendingCount');

let allPolls = {};
let myVotes = JSON.parse(localStorage.getItem('npaVotes')) || {};
let pendingVotes = {}; // Diri isave ang mga gi-click pero wala pa gi-submit

const pollsRef = ref(db, 'votingPollSystem/polls');

onValue(pollsRef, (snapshot) => {
    if (snapshot.exists()) {
        allPolls = snapshot.val();
        renderPolls();
    } else {
        if (pollContainer) pollContainer.innerHTML = "<p style='text-align:center;'>No ballots found in database.</p>";
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
                const isPendingPick = pendingVotes[id] === optKey; // Na-click pero wa pa na-save
                
                let btnStyle = "";
                let btnText = "Select";

                if (isMyPick) {
                    btnStyle = "background: var(--gold); color: black; border: 2px solid white;";
                    btnText = "✓ SAVED";
                } else if (isPendingPick) {
                    btnStyle = "background: white; color: black; border: 2px solid var(--npa-blue); font-weight: bold;";
                    btnText = "• SELECTED";
                }
                
                optionsHtml += `
                    <div style="margin: 10px 0; display: flex; justify-content: space-between; align-items: center; padding: 10px; background: #222; border-radius: 6px; ${isMyPick ? 'border: 1px solid var(--gold);' : ''} ${isPendingPick ? 'border: 1px solid white;' : ''}">
                        <span style="font-weight: 600; ${isMyPick || isPendingPick ? 'color: var(--gold);' : ''}">${poll.options[optKey].text}</span>
                        <div class="btn-group">
                            <button 
                                style="${btnStyle}"
                                ${isClosed || hasVotedForThis ? 'disabled' : ''} 
                                onclick="selectVote('${id}', '${optKey}')">
                                ${isClosed ? "CLOSED" : btnText}
                            </button>
                        </div>
                    </div>`;
            }

            card.innerHTML = `
                <div style="display:flex; justify-content:space-between; margin-bottom: 10px;">
                    <span class="status-badge ${poll.status.toLowerCase()}">${poll.status}</span>
                    <small style="color: var(--gold); font-weight: bold;">${hasVotedForThis ? "LOCKED IN" : "PENDING"}</small>
                </div>
                <h3 style="margin-bottom: 15px;">${poll.question}</h3>
                ${optionsHtml}
            `;
            pollContainer.appendChild(card);
        }
    }

    if (!found) pollContainer.innerHTML = "<p style='text-align:center;'>No matching ballots found for your search/filter.</p>";
}

// Function para mu-pili ug player
window.selectVote = (pollId, optKey) => {
    if (myVotes[pollId]) return; // Dili na mapislit kung naka-vote na sa una
    pendingVotes[pollId] = optKey; // I-save sa temporary memory
    
    // I-update ang text sa Floating Bar
    const pendingAmount = Object.keys(pendingVotes).length;
    pendingCountText.innerText = `${pendingAmount} Pending Selection${pendingAmount > 1 ? 's' : ''}`;
    submitBar.style.display = 'block'; // Ipakita ang submit bar
    
    renderPolls(); 
};

// Function inig click sa SUBMIT button
if (submitAllBtn) {
    submitAllBtn.addEventListener('click', () => {
        submitAllBtn.innerText = "SAVING...";
        submitAllBtn.disabled = true;

        for (let pollId in pendingVotes) {
            const optKey = pendingVotes[pollId];
            const currentVotes = allPolls[pollId].options[optKey].votes || 0;
            // I-push sa database
            update(ref(db, `votingPollSystem/polls/${pollId}/options/${optKey}`), { votes: currentVotes + 10 });
            // I-save sa permanent memory
            myVotes[pollId] = optKey;
        }

        // I-save sa device sa user
        localStorage.setItem('npaVotes', JSON.stringify(myVotes));
        
        // Limpyohan ang temporary memory
        pendingVotes = {};
        
        setTimeout(() => {
            submitBar.style.display = 'none';
            submitAllBtn.innerText = "🔒 SUBMIT BALLOT";
            submitAllBtn.disabled = false;
            
            const toast = document.createElement('div');
            toast.style.cssText = "position:fixed; top:20px; right:20px; background:var(--gold); color:#000; padding:15px; border-radius:8px; font-weight:bold; z-index:1000; box-shadow: 0 4px 15px rgba(0,0,0,0.5);";
            toast.innerText = `✅ Official Ballot Saved Successfully!`;
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 3000);
            
            renderPolls();
        }, 800); // Gamayng delay para mutuo ang user nga nag-loading hehe
    });
}

if(searchInput) searchInput.addEventListener('input', renderPolls);
if(categoryFilter) categoryFilter.addEventListener('change', renderPolls);
if(statusFilter) statusFilter.addEventListener('change', renderPolls);
