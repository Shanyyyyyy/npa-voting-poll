





// Ayaw hilabti nang nasa sulod sa firebaseConfig bay ha! Importante kaayo nang mga numbers og link diha kay diha naga konektar ang database maski giilisdan na nato ug NPA ang site.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getDatabase, ref, push, set, onValue, update } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

const firebaseConfig = {
   apiKey: "AIzaSyD0e0CnpOqA9aT2Q9EemzFiP1S4gY4VSPY",
  authDomain: "nba-voting-poll.firebaseapp.com",
  databaseURL: "https://nba-voting-poll-default-rtdb.firebaseio.com",
  projectId: "nba-voting-poll",
  storageBucket: "nba-voting-poll.firebasestorage.app",
  messagingSenderId: "803241533057",
  appId: "1:803241533057:web:77008483b528ed6167b780",
  measurementId: "G-E5KLCGG7N7"
};

// Gi-initialize ang database connection diri dapita
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Gi-export ang mga tools para makagamit ang ubang js files (vote.js, results.js)
export { db, ref, push, set, onValue, update };