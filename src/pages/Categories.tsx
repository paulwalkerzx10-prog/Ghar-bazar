import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Icons from 'lucide-react';

export default function Categories() {
  const [categories, setCategories] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.ok ? res.json() : [])
      .then(data => setCategories(data || []))
      .catch(err => {
        
        setCategories([]);
      });
  }, []);

  return (
    <div className="pb-24 pt-4 px-4 max-w-lg mx-auto min-h-screen bg-gray-50">
      <h1 className="text-xl font-bold text-gray-900 mb-6">All Categories</h1>
      <div className="grid grid-cols-3 gap-4">
        {categories.map((cat) => {
          const Icon = (Icons as any)[cat.icon_url] || Icons.HelpCircle;
          return (
            <div 
              key={cat.id} 
              onClick={() => navigate(`/category?id=${cat.id}&name=${encodeURIComponent(cat.name)}`)}
              className="flex flex-col items-center gap-2 cursor-pointer p-2 bg-white rounded-xl shadow-sm border border-gray-100 hover:border-green-300 transition-colors"
            >
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-green-600">
                <Icon size={28} />
              </div>
              <span className="text-xs font-semibold text-gray-700 text-center leading-tight">{cat.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
