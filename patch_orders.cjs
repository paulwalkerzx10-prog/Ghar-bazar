const fs = require('fs');
let code = fs.readFileSync('src/pages/Orders.tsx', 'utf-8');

code = code.replace(
  "import { useAuth } from '../context/AuthContext.tsx';",
  "import { useAuth } from '../context/AuthContext.tsx';\nimport { collection, query, where, orderBy, getDocs } from 'firebase/firestore';\nimport { db } from '../lib/firebase.ts';"
);

code = code.replace(
  /const fetchOrders = async \(\) => \{[\s\S]*?\};/,
  `const fetchOrders = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'orders'), where('userId', '==', user!.uid), orderBy('created_at', 'desc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrders(data);
    } catch (err) {
      console.error(err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };`
);

fs.writeFileSync('src/pages/Orders.tsx', code);
