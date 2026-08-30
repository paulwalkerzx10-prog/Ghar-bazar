import { initializeApp } from 'firebase/app';
import { initializeFirestore } from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json';
const app = initializeApp(firebaseConfig);
const db = initializeFirestore(app, { experimentalForceLongPolling: true }, firebaseConfig.firestoreDatabaseId);

import { collection, getDocs } from 'firebase/firestore';
async function test() {
  try {
    const querySnapshot = await getDocs(collection(db, 'products'));
    console.log("Success with long polling, found documents:", querySnapshot.docs.length);
  } catch (e) {
    console.error("Error connecting:", e);
  }
}
test();
