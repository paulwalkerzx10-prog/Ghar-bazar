import React, { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { db, auth } from '../lib/firebase.ts';
import { useNavigate } from 'react-router-dom';
import { LogOut, Trash2 } from 'lucide-react';
import { signOut } from 'firebase/auth';

export default function Admin() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  
  // Forms
  const [prodForm, setProdForm] = useState({ name: '', description: '', price: '', stock: '', weight: '', categoryId: '', image_url: '' });
  
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const pSnap = await getDocs(collection(db, 'products'));
      setProducts(pSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      
      const cSnap = await getDocs(query(collection(db, 'categories'), orderBy('display_order')));
      setCategories(cSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      
      const bSnap = await getDocs(query(collection(db, 'banners'), orderBy('display_order')));
      setBanners(bSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      
      const oSnap = await getDocs(query(collection(db, 'orders')));
      setOrders(oSnap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newProduct = {
        ...prodForm,
        price: Number(prodForm.price),
        stock: Number(prodForm.stock),
        unit: prodForm.weight || '1 item',
        in_stock: Number(prodForm.stock) > 0,
        categoryId: prodForm.categoryId // Keep as string or number based on how it's stored
      };
      const docRef = await addDoc(collection(db, 'products'), newProduct);
      
      // Optimistic update
      setProducts(prev => [{ id: docRef.id, ...newProduct }, ...prev]);
      setProdForm({ name: '', description: '', price: '', stock: '', weight: '', categoryId: '', image_url: '' });
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (collectionName: string, id: string) => {
    if (!confirm('Are you sure?')) return;
    
    // Optimistic update
    if (collectionName === 'products') setProducts(prev => prev.filter(p => p.id !== id));
    if (collectionName === 'categories') setCategories(prev => prev.filter(c => c.id !== id));
    if (collectionName === 'banners') setBanners(prev => prev.filter(b => b.id !== id));
    if (collectionName === 'orders') setOrders(prev => prev.filter(o => o.id !== id));

    try {
      await deleteDoc(doc(db, collectionName, id));
    } catch (err) { 
      console.error(err); 
      fetchData(); // revert on error
    }
  };

  const handleUpdateOrderStatus = async (id: string, status: string) => {
    // Optimistic update
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    
    try {
      await updateDoc(doc(db, 'orders', id), { status });
    } catch (err) { 
      console.error(err); 
      fetchData(); // revert on error
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 bg-white border-r border-gray-200 p-6 flex flex-col">
        <h1 className="text-2xl font-black text-gray-900 mb-8">Ghar <span className="text-green-600">Admin</span></h1>
        <nav className="flex flex-col gap-2 flex-1">
          {['products', 'categories', 'banners', 'orders'].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`p-3 text-left rounded-xl font-medium transition-colors ${activeTab === tab ? 'bg-green-50 text-green-700' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
        <button onClick={() => { signOut(auth); navigate('/'); }} className="flex items-center text-red-600 font-medium p-3 hover:bg-red-50 rounded-xl">
          <LogOut size={18} className="mr-2" /> Exit Admin
        </button>
      </aside>
      
      <main className="flex-1 p-8 overflow-y-auto">
        {activeTab === 'products' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Products</h2>
            <form onSubmit={handleAddProduct} className="bg-white p-6 rounded-2xl shadow-sm mb-8 grid grid-cols-2 gap-4">
              <input placeholder="Name" required value={prodForm.name} onChange={e => setProdForm({...prodForm, name: e.target.value})} className="p-2 border rounded" />
              <input placeholder="Price" type="number" required value={prodForm.price} onChange={e => setProdForm({...prodForm, price: e.target.value})} className="p-2 border rounded" />
              <input placeholder="Stock" type="number" required value={prodForm.stock} onChange={e => setProdForm({...prodForm, stock: e.target.value})} className="p-2 border rounded" />
              <input placeholder="Weight (e.g. 1kg)" required value={prodForm.weight} onChange={e => setProdForm({...prodForm, weight: e.target.value})} className="p-2 border rounded" />
              <input placeholder="Category ID" required value={prodForm.categoryId} onChange={e => setProdForm({...prodForm, categoryId: e.target.value})} className="p-2 border rounded" />
              <input placeholder="Image URL" required value={prodForm.image_url} onChange={e => setProdForm({...prodForm, image_url: e.target.value})} className="p-2 border rounded" />
              <button type="submit" className="col-span-2 bg-green-600 text-white p-2 rounded font-bold">Add Product</button>
            </form>
            <div className="grid grid-cols-4 gap-4">
              {products.map(p => (
                <div key={p.id} className="bg-white p-4 rounded shadow-sm flex flex-col items-center">
                  <img src={p.image_url} className="w-16 h-16 object-cover mb-2 rounded" />
                  <p className="font-bold">{p.name}</p>
                  <p className="text-sm">₹{p.price}</p>
                  <button onClick={() => handleDelete('products', p.id)} className="text-red-500 mt-2"><Trash2 size={16}/></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Categories</h2>
            <div className="grid grid-cols-4 gap-4">
              {categories.map(c => (
                <div key={c.id} className="bg-white p-4 rounded shadow-sm flex flex-col items-center">
                  <img src={c.image_url} className="w-16 h-16 object-cover mb-2 rounded" />
                  <p className="font-bold">{c.name}</p>
                  <button onClick={() => handleDelete('categories', c.id)} className="text-red-500 mt-2"><Trash2 size={16}/></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'banners' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Banners</h2>
            <div className="grid grid-cols-2 gap-4">
              {banners.map(b => (
                <div key={b.id} className="bg-white p-4 rounded shadow-sm flex flex-col items-center">
                  <img src={b.image_url} className="w-full h-32 object-cover mb-2 rounded" />
                  <button onClick={() => handleDelete('banners', b.id)} className="text-red-500 mt-2"><Trash2 size={16}/></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Orders</h2>
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50">
                  <tr><th className="p-4">Customer</th><th className="p-4">Total</th><th className="p-4">Status</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.map(o => (
                    <tr key={o.id}>
                      <td className="p-4">{o.customer_name}<br/><span className="text-xs text-gray-500">{o.address}</span></td>
                      <td className="p-4 font-bold">₹{o.total_amount}</td>
                      <td className="p-4">
                        <select value={o.status} onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)} className="p-1 border rounded">
                          <option>Placed</option><option>Confirmed</option><option>Out for Delivery</option><option>Delivered</option><option>Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
