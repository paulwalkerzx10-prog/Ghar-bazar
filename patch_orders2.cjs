const fs = require('fs');
let code = fs.readFileSync('src/pages/Orders.tsx', 'utf-8');

code = code.replace(
  "const q = query(collection(db, 'orders'), where('userId', '==', user!.uid), orderBy('created_at', 'desc'));",
  "const q = query(collection(db, 'orders'), where('userId', '==', user!.uid)); // Client-side sort to avoid index requirements"
);

code = code.replace(
  "const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));",
  "const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());"
);

fs.writeFileSync('src/pages/Orders.tsx', code);
