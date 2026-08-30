const fs = require('fs');
let code = fs.readFileSync('src/pages/Profile.tsx', 'utf-8');

code = code.replace(
  "import { useAuth } from '../context/AuthContext.tsx';",
  "import { useAuth } from '../context/AuthContext.tsx';\nimport { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';\nimport { db } from '../lib/firebase.ts';"
);

code = code.replace(
  /fetch\('\/api\/profile', \{ headers: \{ Authorization: `Bearer \$\{token\}` \} \}\)[\s\S]*?\.catch\(err => console\.error\(err\)\);/,
  `getDoc(doc(db, 'customers', user!.uid))
        .then(docSnap => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setProfile(data);
            const savedAddrs = Array.isArray(data.addresses) ? data.addresses : [];
            const addrs = savedAddrs.length > 0 ? savedAddrs : (data.address ? [data.address] : []);
            setForm({ 
              name: data.name || '', 
              phone: data.phone || '', 
              address: data.address || '',
              addresses: addrs
            });
          }
        })
        .catch(err => console.error(err));`
);

code = code.replace(
  /const res = await fetch\('\/api\/profile', \{[\s\S]*?\}\);[\s\S]*?if \(res\.ok\) \{[\s\S]*?const data = await res\.json\(\);/,
  `await setDoc(doc(db, 'customers', user!.uid), payload, { merge: true });
      const docSnap = await getDoc(doc(db, 'customers', user!.uid));
      if (docSnap.exists()) {
        const data = docSnap.data();`
);

code = code.replace(
  /try \{[\s\S]*?await fetch\('\/api\/profile', \{[\s\S]*?body: JSON\.stringify\(\{ \.\.\.form, address: addr \}\)[\s\S]*?\}\);[\s\S]*?setProfile\(\{ \.\.\.profile, address: addr \}\);[\s\S]*?\} catch \(err\) \{\}/,
  `try {
        await updateDoc(doc(db, 'customers', user!.uid), { address: addr });
        setProfile({ ...profile, address: addr });
      } catch (err) {}`
);

fs.writeFileSync('src/pages/Profile.tsx', code);
