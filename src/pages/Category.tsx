import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import ProductCard from '../components/ProductCard.tsx';

export default function Category() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const categoryId = searchParams.get('id');
  const categoryName = searchParams.get('name');

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let url = '/api/products';
    if (categoryId) url += `?category_id=${categoryId}`;
    
    fetch(url)
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        setProducts(data || []);
        setLoading(false);
      })
      .catch(err => {
        
        setProducts([]);
        setLoading(false);
      });
  }, [categoryId]);

  return (
    <div className="pb-24 pt-4 px-4 max-w-lg mx-auto min-h-screen bg-gray-50">
      <div className="flex items-center mb-6">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors mr-2">
          <ArrowLeft size={24} className="text-gray-800" />
        </button>
        <h1 className="text-xl font-bold text-gray-900">{categoryName || 'Products'}</h1>
      </div>

      {loading ? (
        <div className="flex justify-center text-green-600">Loading...</div>
      ) : products.length === 0 ? (
        <div className="text-center text-gray-500 mt-10">No products found.</div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
