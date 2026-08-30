const fs = require('fs');
let code = fs.readFileSync('src/pages/Cart.tsx', 'utf-8');

code = code.replace(
  "import { useAuth } from '../context/AuthContext.tsx';",
  "import { useAuth } from '../context/AuthContext.tsx';\nimport { doc, getDoc, collection, addDoc } from 'firebase/firestore';\nimport { db } from '../lib/firebase.ts';"
);

code = code.replace(
  "fetch('/api/profile', { headers: { Authorization: `Bearer ${token}` } })",
  "getDoc(doc(db, 'customers', user!.uid))"
);
code = code.replace(
  ".then(res => res.ok ? res.json() : null)",
  ".then(snap => snap.exists() ? snap.data() : null)"
);
code = code.replace(
  "const handlePlaceOrder = async () => {",
  `const handlePlaceOrder = async () => {`
);

code = code.replace(
  /const payload = \{[\s\S]*?\};/,
  `const payload = {
        userId: user!.uid,
        customer_name: name,
        phone_number: phone,
        address: finalAddress,
        latitude,
        longitude,
        delivery_slot: slot,
        status: 'Placed',
        total_amount: itemTotal,
        created_at: new Date().toISOString(),
        items: items.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price_at_order: item.price,
          product: item // embed product data for easy display
        }))
      };`
);

code = code.replace(
  /const res = await fetch\('\/api\/orders', \{[\s\S]*?\}\);[\s\S]*?if \(!res\.ok\) throw new Error\("Failed to place order"\);[\s\S]*?const data = await res\.json\(\);/,
  `const docRef = await addDoc(collection(db, 'orders'), payload);
      const data = { id: docRef.id };`
);

fs.writeFileSync('src/pages/Cart.tsx', code);
