import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin } from 'lucide-react';
import * as Icons from 'lucide-react';
import ProductCard from '../components/ProductCard.tsx';
import { useAuth } from '../context/AuthContext.tsx';

export default function Home() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [address, setAddress] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      fetch('/api/profile', { headers: { Authorization: `Bearer ${token}` } })
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data && data.address) {
            setAddress(data.address);
          }
        })
        .catch(() => {});
    }
  }, [token]);

  useEffect(() => {
    Promise.all([
      fetch('/api/categories').then(res => res.ok ? res.json() : []).catch(() => []),
      fetch('/api/products').then(res => res.ok ? res.json() : []).catch(() => []),
      fetch('/api/banners').then(res => res.ok ? res.json() : []).catch(() => [])
    ]).then(([cats, prods, bans]) => {
      setCategories(cats || []);
      setProducts(prods || []);
      setBanners(bans || []);
      setLoading(false);
    }).catch(err => {
      
      setCategories([]);
      setProducts([]);
      setBanners([]);
      setLoading(false);
    });
  }, []);

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-green-600">Loading...</div>;
  }

  return (
    <div className="pb-24 pt-4 px-4 max-w-lg mx-auto min-h-screen bg-gray-50">
      {/* Header */}
      <header className="mb-6 flex items-center justify-between">
        <div onClick={() => navigate('/profile')} className="cursor-pointer group">
          <h1 className="text-2xl font-black text-gray-900 tracking-tight group-hover:opacity-80 transition-opacity">Ghar <span className="text-green-600">bazzar</span></h1>
          <div className="flex items-center text-gray-500 text-sm mt-1">
            <MapPin size={14} className="mr-1 text-green-600 shrink-0" />
            <span className="truncate max-w-[200px] group-hover:text-green-600 transition-colors">
              {address ? `Deliver to: ${address}` : 'Tap to add address'}
            </span>
          </div>
        </div>
      </header>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for 'milk', 'eggs', 'chips'..." 
          className="w-full bg-white border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 shadow-sm transition-all"
        />
      </div>

      {/* Banners Horizontal Scroll */}
      {banners.length > 0 && !searchQuery && (
        <div className="mb-8">
          <div className="flex overflow-x-auto pb-4 -mx-4 px-4 gap-4 snap-x hide-scrollbar" style={{ scrollbarWidth: 'none' }}>
            {banners.map((banner) => (
              <div key={banner.id} className="min-w-[280px] sm:min-w-[320px] snap-center shrink-0">
                <img 
                  src={banner.image_url} 
                  alt="Offer Banner" 
                  className="w-full h-36 object-cover rounded-2xl shadow-sm border border-gray-100"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Categories Horizontal Scroll */}
      {!searchQuery && (
        <div className="mb-8">
          <div className="flex overflow-x-auto pb-4 -mx-4 px-4 gap-4 snap-x hide-scrollbar" style={{ scrollbarWidth: 'none' }}>
            {categories.map((cat) => {
              const Icon = (Icons as any)[cat.icon_url] || Icons.HelpCircle;
              return (
                <div 
                  key={cat.id} 
                  onClick={() => navigate(`/category?id=${cat.id}&name=${encodeURIComponent(cat.name)}`)}
                  className="flex flex-col items-center gap-2 min-w-[72px] snap-start cursor-pointer group"
                >
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 text-green-600 group-hover:border-green-300 transition-colors">
                    <Icon size={28} />
                  </div>
                  <span className="text-[10px] font-semibold text-gray-600 text-center leading-tight group-hover:text-green-600 transition-colors">{cat.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Popular Products Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">{searchQuery ? 'Search Results' : 'Popular Products'}</h2>
          {!searchQuery && <button className="text-green-600 text-sm font-semibold hover:underline">See all</button>}
        </div>
        
        {filteredProducts.length === 0 ? (
          <div className="text-center py-10 text-gray-500">No products found.</div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
