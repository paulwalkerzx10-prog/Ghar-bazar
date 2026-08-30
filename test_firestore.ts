import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json';
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function test() {
  try {
    const querySnapshot = await getDocs(collection(db, 'products'));
    console.log("Success, found documents:", querySnapshot.docs.length);
  } catch (e) {
    console.error("Error connecting:", e);
  }
}
test();
