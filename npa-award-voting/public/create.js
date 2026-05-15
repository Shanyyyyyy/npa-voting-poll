// Mao ni ang codes para mugana ang admin page nato bay (pag add ug awards sa database)
import { db, ref, push, set } from './firebase.js';

const createBtn = document.getElementById('createPollBtn');
const injectBtn = document.getElementById('autoInjectBtn');
const messageDiv = document.getElementById('message');

// Function para man-mano nga pagbutang ug bag-ong awrad
if (createBtn) {
    createBtn.addEventListener('click', async () => {
        const question = document.getElementById('pollQuestion').value.trim();
        const category = document.getElementById('pollCategory').value;
        const options = [
            document.getElementById('opt1').value.trim(),
            document.getElementById('opt2').value.trim(),
            document.getElementById('opt3').value.trim(),
            document.getElementById('opt4').value.trim()
        ].filter(opt => opt !== "");

        if (!question || options.length < 2) {
            showMessage("Please provide a question and at least 2 candidates.", "red");
            return;
        }

        createBtn.disabled = true;
        createBtn.innerText = "DEPLOYING...";

        try {
            const pollsRef = ref(db, 'votingPollSystem/polls');
            const newPollRef = push(pollsRef);

            const optionsData = {};
            options.forEach((opt, index) => {
                optionsData[`opt${index + 1}`] = { text: opt, votes: 0 };
            });

            await set(newPollRef, {
                question,
                category,
                status: "Open",
                createdAt: Date.now(),
                options: optionsData
            });

            showMessage("✅ Ballot Deployed Successfully!", "var(--gold)");
            // Limpyohan ang mga box pagkahuman ug upload
            document.getElementById('pollQuestion').value = "";
            document.getElementById('opt1').value = "";
            document.getElementById('opt2').value = "";
            document.getElementById('opt3').value = "";
            document.getElementById('opt4').value = "";
        } catch (error) {
            console.error(error);
            showMessage("Error deploying ballot.", "red");
        } finally {
            createBtn.disabled = false;
            createBtn.innerText = "DEPLOY INDIVIDUAL BALLOT";
        }
    });
}

// Function kani para auto-generate sa mga finalists
if (injectBtn) {
    injectBtn.addEventListener('click', async () => {
        injectBtn.innerText = "GENERATING...";
        injectBtn.disabled = true;

        const finalists = [
            { q: "2026 Most Valuable Player", cat: "Award", opts: ["Shai Gilgeous-Alexander", "Nikola Jokić", "Victor Wembanyama"] },
            { q: "2026 Rookie of the Year", cat: "Award", opts: ["Cooper Flagg", "Kon Knueppel", "VJ Edgecombe"] },
            { q: "2026 Defensive Player of the Year", cat: "Award", opts: ["Victor Wembanyama", "Chet Holmgren", "Ausar Thompson"] },
            { q: "2026 Sixth Man of the Year", cat: "Award", opts: ["Keldon Johnson", "Jaime Jaquez Jr.", "Tim Hardaway Jr."] },
            { q: "2026 Coach of the Year", cat: "Award", opts: ["Joe Mazzulla", "J.B. Bickerstaff", "Mitch Johnson"] }
        ];

        try {
            const pollsRef = ref(db, 'votingPollSystem/polls');
            for (let f of finalists) {
                const newPollRef = push(pollsRef);
                const optionsData = {};
                f.opts.forEach((name, index) => {
                    optionsData[`opt${index + 1}`] = { text: name, votes: 0 };
                });

                await set(newPollRef, {
                    question: f.q,
                    category: f.cat,
                    status: "Open",
                    createdAt: Date.now(),
                    options: optionsData
                });
            }
            showMessage("✅ All 2026 NPA Finalists Injected!", "var(--gold)");
            injectBtn.innerText = "INJECTION COMPLETE";
        } catch (error) {
            console.error(error);
            showMessage("Injection failed.", "red");
            injectBtn.disabled = false;
            injectBtn.innerText = "RETRY AUTO-GENERATE";
        }
    });
}

function showMessage(text, color) {
    messageDiv.innerText = text;
    messageDiv.style.color = color;
    setTimeout(() => { if(messageDiv.innerText === text) messageDiv.innerText = ""; }, 4000);
}