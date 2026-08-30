const fs = require('fs');
let code = fs.readFileSync('src/pages/OrderTracking.tsx', 'utf-8');

code = code.replace(
  "import { useAuth } from '../context/AuthContext.tsx';",
  "import { useAuth } from '../context/AuthContext.tsx';\nimport { doc, getDoc } from 'firebase/firestore';\nimport { db } from '../lib/firebase.ts';"
);

code = code.replace(
  /useEffect\(\(\) => \{[\s\S]*?\}, \[id, token, user, loading\]\);/,
  `useEffect(() => {
    if (user && id) {
      getDoc(doc(db, 'orders', id))
        .then(docSnap => {
          if (docSnap.exists() && docSnap.data().userId === user.uid) {
            setOrder({ id: docSnap.id, ...docSnap.data() });
          } else {
            setOrder(null);
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    } else if (!user && loading) {
        setLoading(false);
    }
  }, [id, user, loading]);`
);

fs.writeFileSync('src/pages/OrderTracking.tsx', code);
