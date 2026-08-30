import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { readFileSync } from 'fs';

const config = JSON.parse(readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function checkIndex() {
  try {
    await getDocs(query(collection(db, 'banners'), where('is_active', '==', true), orderBy('display_order')));
    console.log("Banner query OK");
  } catch (err) {
    console.error("Banner query error:", err.message);
  }
}
checkIndex();
