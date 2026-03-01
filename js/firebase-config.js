// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBpQriwrmc9VZCl9jjZ7kbm368edIoioL0",
  authDomain: "vedamesports.firebaseapp.com",
  projectId: "vedamesports",
  storageBucket: "vedamesports.firebasestorage.app",
  messagingSenderId: "781685820845",
  appId: "1:781685820845:web:d75bac4bc3ce74ea95a524",
  measurementId: "G-F8914ZTVTY"
};

// Wait for Firebase to be loaded
let firebaseLoaded = false;

// Initialize Firebase when loaded
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Dynamically import Firebase modules
    const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
    const { getFirestore, collection, addDoc, getDocs, getDoc, setDoc, doc, updateDoc, deleteDoc, serverTimestamp, query, orderBy, where, onSnapshot } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
    const { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');

    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    const auth = getAuth(app);

    // Export Firebase functions
    window.firebase = {
      db,
      auth,
      collection,
      addDoc,
      getDocs,
      getDoc,
      setDoc,
      doc,
      updateDoc,
      deleteDoc,
      serverTimestamp,
      query,
      orderBy,
      where,
      signInWithEmailAndPassword,
      signOut,
      onAuthStateChanged,
      onSnapshot
    };

    firebaseLoaded = true;

    // Initialize default data
    initializeTournaments();
    initializeGames();

  } catch (error) {
    console.error('Firebase initialization error:', error);
    // Create mock Firebase object for development
    window.firebase = createMockFirebase();
  }
});

async function initializeTournaments() {
  if (!window.firebase || !firebaseLoaded) return;
  try {
    const tournamentsRef = window.firebase.collection(window.firebase.db, 'tournaments');
    const snapshot = await window.firebase.getDocs(tournamentsRef);
    
    if (snapshot.empty) {
      // Add default tournaments if none exist
      const defaultTournaments = [
        {
          name: "Haunt the Arena: Tekken 7 Showdown",
          game: "tekken7",
          date: new Date('2025-10-31T18:00:00'),
          status: "upcoming",
          winner: null,
          format: "1v1 Knockout",
          prizePool: "TBD",
          description: "Face your fears in the ultimate fighting tournament"
        },
        {
          name: "Haunt the Arena: BGMI Knockout",
          game: "bgmi",
          date: new Date('2025-10-31T20:00:00'),
          status: "upcoming",
          winner: null,
          format: "4v4 Knockout",
          prizePool: "TBD",
          description: "Survive the night in the ultimate battle royale"
        }
      ];
      
      for (const tournament of defaultTournaments) {
        await window.firebase.addDoc(tournamentsRef, tournament);
      }
    }
  } catch (error) {
    console.error('Error initializing tournaments:', error);
  }
}

async function initializeGames() {
  if (!window.firebase || !firebaseLoaded) return;
  try {
    const gamesRef = window.firebase.collection(window.firebase.db, 'games');
    const snapshot = await window.firebase.getDocs(gamesRef);
    
    if (snapshot.empty) {
      const defaultGames = [
        {
          id: "tekken7",
          name: "Tekken 7",
          description: "1v1 Fighting Tournament",
          platform: "PC/Console",
          maxPlayers: 1,
          icon: "🥊",
          color: "#d4af37"
        },
        {
          id: "bgmi",
          name: "BGMI Arena",
          description: "4v4 Battle Royale",
          platform: "Mobile",
          maxPlayers: 4,
          icon: "🎯",
          color: "#c41e3a"
        }
      ];
      
      for (const game of defaultGames) {
        await window.firebase.addDoc(gamesRef, game);
      }
    }
  } catch (error) {
    console.error('Error initializing games:', error);
  }
}

// Mock Firebase for development
function createMockFirebase() {
  return {
    db: null,
    auth: null,
    collection: () => ({}),
    addDoc: async () => ({ id: 'mock-id' }),
    getDocs: async () => ({ empty: true, forEach: () => {} }),
    doc: () => ({}),
    updateDoc: async () => {},
    query: () => ({}),
    orderBy: () => ({}),
    where: () => ({}),
    signInWithEmailAndPassword: async () => {},
    signOut: async () => {},
    onAuthStateChanged: () => () => {},
    serverTimestamp: () => new Date()
  };
}
