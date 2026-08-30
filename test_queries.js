import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, orderBy, where, doc, getDoc } from 'firebase/firestore';
import { readFileSync } from 'fs';

const config = JSON.parse(readFileSync('./firebase-applet-config.json', 'utf8'));

const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function test() {
  try {
    console.log("Testing categories...");
    await getDocs(query(collection(db, 'categories'), orderBy('display_order')));
    console.log("Categories OK");
    
    console.log("Testing products...");
    await getDocs(collection(db, 'products'));
    console.log("Products OK");
    
    console.log("Testing banners...");
    await getDocs(query(collection(db, 'banners'), where('is_active', '==', true), orderBy('display_order')));
    console.log("Banners OK");
    
  } catch (e) {
    console.error("Error:", e.message);
  }
}
test();
