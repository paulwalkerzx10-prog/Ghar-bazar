const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, orderBy, where, doc, getDoc } = require('firebase/firestore');
const config = require('./firebase-applet-config.json');

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
