// Mao ni ang codes para mugana ang admin page nato bay (pag add ug awards sa database)
import { db, ref, push, set } from './firebase.js';

const createBtn = document.getElementById('createPollBtn');
const injectBtn = document.getElementById('autoInjectBtn');
const messageDiv = document.getElementById('message');


// Diri nimo idugang ang ubang pangalan kung gusto nimo padak-an ang listahan

    // --- ANG MASTER LIST SA MGA VALID NGA NPA PLAYERS UG COACHES ---
const validCandidates = [
    // 🌟 2026 ROOKIE CLASS (The Next Gen)
    "Cooper Flagg", "Ace Bailey", "Dylan Harper", "VJ Edgecombe", "Kon Knueppel", 
    "Nolan Traore", "Hugo Gonzalez", "Tre Johnson", "Drake Powell",

    // 🦅 ATLANTA HAWKS
    "Trae Young", "Jalen Johnson", "Bogdan Bogdanovic", "Zaccharie Risacher", "Clint Capela", "De'Andre Hunter", "Dyson Daniels",
    // 🍀 BOSTON CELTICS
    "Jayson Tatum", "Jaylen Brown", "Derrick White", "Jrue Holiday", "Kristaps Porzingis", "Al Horford", "Payton Pritchard", "Joe Mazzulla",
    // 🕸️ BROOKLYN NETS
    "Cam Thomas", "Nic Claxton", "Dennis Schroder", "Cameron Johnson", "Noah Clowney",
    // 🐝 CHARLOTTE HORNETS
    "LaMelo Ball", "Brandon Miller", "Mark Williams", "Miles Bridges", "Josh Green",
    // 🐂 CHICAGO BULLS
    "Zach LaVine", "Coby White", "Josh Giddey", "Matas Buzelis", "Nikola Vucevic", "Ayo Dosunmu",
    // ⚔️ CLEVELAND CAVALIERS
    "Donovan Mitchell", "Darius Garland", "Evan Mobley", "Jarrett Allen", "Max Strus", "Caris LeVert",
    // 🐎 DALLAS MAVERICKS
    "Luka Doncic", "Kyrie Irving", "Dereck Lively II", "Klay Thompson", "PJ Washington", "Daniel Gafford",
    // ⛏️ DENVER NUGGETS
    "Nikola Jokic", "Jamal Murray", "Aaron Gordon", "Michael Porter Jr.", "Christian Braun", "Peyton Watson", "Russell Westbrook",
    // ⚙️ DETROIT PISTONS
    "Cade Cunningham", "Jaden Ivey", "Jalen Duren", "Ausar Thompson", "Isaiah Stewart", "Ron Holland II",
    // 🌉 GOLDEN STATE WARRIORS
    "Stephen Curry", "Draymond Green", "Jonathan Kuminga", "Brandin Podziemski", "Andrew Wiggins", "Trayce Jackson-Davis", "Buddy Hield",
    // 🚀 HOUSTON ROCKETS
    "Alperen Sengun", "Jalen Green", "Fred VanVleet", "Amen Thompson", "Reed Sheppard", "Jabari Smith Jr.", "Dillon Brooks",
    // 🏎️ INDIANA PACERS
    "Tyrese Haliburton", "Pascal Siakam", "Myles Turner", "Bennedict Mathurin", "Andrew Nembhard", "Aaron Nesmith",
    // ⛵ LA CLIPPERS
    "Kawhi Leonard", "James Harden", "Norman Powell", "Ivica Zubac", "Terance Mann", "Kevin Porter Jr.",
    // 👑 LOS ANGELES LAKERS
    "LeBron James", "Anthony Davis", "Austin Reaves", "D'Angelo Russell", "Dalton Knecht", "Rui Hachimura",
    // 🐻 MEMPHIS GRIZZLIES
    "Ja Morant", "Jaren Jackson Jr.", "Desmond Bane", "Zach Edey", "Marcus Smart", "Vince Williams Jr.", "GG Jackson",
    // 🔥 MIAMI HEAT
    "Jimmy Butler", "Bam Adebayo", "Tyler Herro", "Terry Rozier", "Jaime Jaquez Jr.", "Nikola Jovic", "Kel'el Ware",
    // 🦌 MILWAUKEE BUCKS
    "Giannis Antetokounmpo", "Damian Lillard", "Khris Middleton", "Brook Lopez", "Bobby Portis", "Gary Trent Jr.",
    // 🐺 MINNESOTA TIMBERWOLVES
    "Anthony Edwards", "Rudy Gobert", "Julius Randle", "Jaden McDaniels", "Naz Reid", "Donte DiVincenzo", "Rob Dillingham",
    // ⚜️ NEW ORLEANS PELICANS
    "Zion Williamson", "Brandon Ingram", "CJ McCollum", "Dejounte Murray", "Trey Murphy III", "Herb Jones",
    // 🗽 NEW YORK KNICKS
    "Jalen Brunson", "Karl-Anthony Towns", "Mikal Bridges", "OG Anunoby", "Josh Hart", "Miles McBride",
    // ⚡ OKLAHOMA CITY THUNDER
    "Shai Gilgeous-Alexander", "Chet Holmgren", "Jalen Williams", "Alex Caruso", "Isaiah Hartenstein", "Lu Dort", "Cason Wallace", "Mark Daigneault",
    // 🪄 ORLANDO MAGIC
    "Paolo Banchero", "Franz Wagner", "Jalen Suggs", "Wendell Carter Jr.", "Jonathan Isaac", "Kentavious Caldwell-Pope",
    // 🔔 PHILADELPHIA 76ERS
    "Joel Embiid", "Tyrese Maxey", "Paul George", "Kelly Oubre Jr.", "Jared McCain", "Andre Drummond",
    // ☀️ PHOENIX SUNS
    "Kevin Durant", "Devin Booker", "Bradley Beal", "Jusuf Nurkic", "Grayson Allen", "Tyus Jones",
    // 🌲 PORTLAND TRAIL BLAZERS
    "Anfernee Simons", "Jerami Grant", "Scoot Henderson", "Deandre Ayton", "Donovan Clingan", "Shaedon Sharpe",
    // 🟣 SACRAMENTO KINGS
    "De'Aaron Fox", "Domantas Sabonis", "DeMar DeRozan", "Keegan Murray", "Malik Monk",
    // 🤠 SAN ANTONIO SPURS
    "Victor Wembanyama", "Chris Paul", "Devin Vassell", "Stephon Castle", "Jeremy Sochan", "Keldon Johnson", "Harrison Barnes",
    // 🦖 TORONTO RAPTORS
    "Scottie Barnes", "Immanuel Quickley", "RJ Barrett", "Gradey Dick", "Jakob Poeltl",
    // 🎷 UTAH JAZZ
    "Lauri Markkanen", "Collin Sexton", "Keyonte George", "Walker Kessler", "John Collins",
    // 🧙‍♂️ WASHINGTON WIZARDS
    "Jordan Poole", "Kyle Kuzma", "Alex Sarr", "Bilal Coulibaly", "Bub Carrington", "Corey Kispert"
].map(name => name.toLowerCase()); // I-convert daan to small letters para dili sensitive sa capitalization


// Function para man-mano nga pagbutang ug bag-ong awrad
if (createBtn) {
    createBtn.addEventListener('click', async () => {
        const question = document.getElementById('pollQuestion').value.trim();
        const category = document.getElementById('pollCategory').value;
        
        // Kuhaon ang mga candidates nga gi-type sa Admin
        const options = [
            document.getElementById('opt1').value.trim(),
            document.getElementById('opt2').value.trim(),
            document.getElementById('opt3').value.trim(),
            document.getElementById('opt4').value.trim()
        ].filter(opt => opt !== "");

        // Error trap #1: Walay pangutana o kulang ang candidates
        if (!question || options.length < 2) {
            showMessage("Please provide a question and at least 2 candidates.", "red");
            return;
        }

        // Error trap #2: NPA Player Validation Check (KANI ANG IMONG GIPADUGANG BAY)
        let invalidCandidate = null;
        for (let i = 0; i < options.length; i++) {
            // Gi-check kung ang gi-type naa ba sa atong master list
            if (!validCandidates.includes(options[i].toLowerCase())) {
                invalidCandidate = options[i]; // Gi-save kinsa ang sayop nga pangalan
                break;
            }
        }

        // Kung naay nakit-an nga dili NPA player, i-block ang pag deploy!
        if (invalidCandidate) {
            showMessage(`❌ ERROR: "${invalidCandidate}" is not a recognized NPA Candidate! Please enter a valid name.`, "red");
            return; // Kani nga 'return' mupugong sa code nga mupadayon padulong sa database
        }

        // Kung pasado sa validation, i-deploy na
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
