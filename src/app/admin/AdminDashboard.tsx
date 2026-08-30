"use client";

import { useState, useEffect, useCallback } from "react";
import { PropertyFormData } from "@/src/types/property";
import { Search, Filter, RefreshCw, Eye, EyeOff, LogOut, Home, Users, TrendingUp } from "lucide-react";
import PropertyModal from "./PropertyModal";

interface AdminDashboardProps {
  onLogout: () => void;
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [properties, setProperties] = useState<any[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProperty, setEditingProperty] = useState<any>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showEmptyPrices, setShowEmptyPrices] = useState(false);

  useEffect(() => {
    fetchProperties();
  }, []);

  useEffect(() => {
    let filtered = [...properties];
    
    if (typeFilter !== 'all') {
      filtered = filtered.filter(p => p.type === typeFilter);
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.title?.toLowerCase().includes(query) ||
        p.address?.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query)
      );
    }
    
    // "بدون قیمت" یعنی مقدار اصلاً ثبت نشده (null)، نه اینکه صفر (توافقی) باشد
    if (!showEmptyPrices) {
      filtered = filtered.filter(p => {
        if (p.type === 'buy') return p.price !== null && p.price !== undefined;
        if (p.type === 'rent') return (p.rent !== null && p.rent !== undefined) || (p.deposit !== null && p.deposit !== undefined);
        return true;
      });
    }
    
    setFilteredProperties(filtered);
  }, [properties, searchQuery, typeFilter, showEmptyPrices]);

  const fetchProperties = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/properties?order=created_at', { cache: 'no-store' });
      if (!res.ok) throw new Error('خطا در دریافت آگهی‌ها');
      const { data } = await res.json();

      // مهم: null را با Number(...) || 0 به صفر تبدیل نکن، وگرنه فرق «توافقی» (۰ عمدی)
      // و «تعیین نشده» (خالی) از بین می‌رود. مقدار null باید null بماند.
      const toNumOrNull = (v: any) => (v === null || v === undefined || v === '' ? null : Number(v));

      const sanitizedData = (data || []).map((property: any) => ({
        ...property,
        price: toNumOrNull(property.price),
        rent: toNumOrNull(property.rent),
        deposit: toNumOrNull(property.deposit),
        meter: Number(property.meter) || 0,
      }));
      
      setProperties(sanitizedData);
      setFilteredProperties(sanitizedData);
    } catch (error) {
      console.error('❌ خطا در دریافت properties:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSubmit = async (data: PropertyFormData) => {
    await fetchProperties();
    alert(editingProperty ? '✅ اطلاعات ویرایش شد!' : '✅ اطلاعات ثبت شد!');
    setIsModalOpen(false);
    setEditingProperty(null);
  };

  const handleEdit = (property: any) => {
    setEditingProperty(property);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('⚠️ آیا از حذف این آگهی اطمینان دارید؟')) return;

    try {
      const propertyToDelete = properties.find(p => p.id === id);

      if (!propertyToDelete) {
        alert('❌ ملک مورد نظر یافت نشد');
        return;
      }

      // حذف از دیتابیس (این API خودش فایل‌های تصویر مرتبط را هم روی سرور پاک می‌کند)
      const res = await fetch(`/api/properties/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'خطا در حذف آگهی');
      }

      setProperties(prev => prev.filter(p => p.id !== id));
      alert('✅ آگهی حذف شد!');

    } catch (error: any) {
      console.error('❌ خطا در حذف property:', error);
      alert(`❌ خطا در حذف آگهی: ${error.message}`);
    }
  };

  // price می‌تواند null (اصلاً ثبت نشده) یا عدد (شامل ۰ به معنای توافقی) باشد
  const formatPrice = (price: number | null | undefined) => {
    if (price === null || price === undefined) return 'قیمت تعیین نشده';
    if (price === 0) return 'توافقی';
    return new Intl.NumberFormat('fa-IR').format(price) + ' تومان';
  };

  const getDealTypeText = (type: string) => {
    switch (type) {
      case 'buy': return 'فروش';
      case 'rent': return 'اجاره';
      default: return type;
    }
  };

  const renderPriceInfo = (property: any) => {
    if (property.type === 'buy') {
      const isSet = property.price !== null && property.price !== undefined;
      const isNegotiable = property.price === 0;
      return (
        <div className={`flex items-center ${!isSet ? 'text-red-500' : ''}`}>
          {!isSet ? (
            <>
              <EyeOff className="w-4 h-4 ml-1" />
              <span className="text-sm">قیمت تعیین نشده</span>
            </>
          ) : (
            <span className={`font-bold ${isNegotiable ? 'text-amber-600' : 'text-green-600'}`}>
              {formatPrice(property.price)}
            </span>
          )}
        </div>
      );
    } else if (property.type === 'rent') {
      const rentSet = property.rent !== null && property.rent !== undefined;
      const depositSet = property.deposit !== null && property.deposit !== undefined;

      if (!rentSet && !depositSet) {
        return (
          <div className="flex items-center text-red-500 text-sm">
            <EyeOff className="w-4 h-4 ml-1" />
            <span>قیمت تعیین نشده</span>
          </div>
        );
      }

      return (
        <div className="space-y-1">
          {rentSet && (
            <div className="flex items-center">
              <span className={`font-bold ${property.rent === 0 ? 'text-amber-600' : 'text-blue-600'}`}>
                اجاره: {formatPrice(property.rent)}
              </span>
            </div>
          )}
          {depositSet && (
            <div className="flex items-center">
              <span className={`${property.deposit === 0 ? 'text-amber-600' : 'text-purple-600'}`}>
                ودیعه: {formatPrice(property.deposit)}
              </span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  // آمار کلی
  const stats = {
    total: properties.length,
    forSale: properties.filter(p => p.type === 'buy').length,
    forRent: properties.filter(p => p.type === 'rent').length,
    withPrice: properties.filter(p => {
      if (p.type === 'buy') return p.price !== null && p.price !== undefined;
      if (p.type === 'rent') return (p.rent !== null && p.rent !== undefined) || (p.deposit !== null && p.deposit !== undefined);
      return false;
    }).length,
    recent: properties.filter(p => {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      return new Date(p.created_at) > oneWeekAgo;
    }).length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-10">
      {/* Navbar */}
      <nav className="">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
            </div>
            
            <div className="flex items-center justify-between w-full">
              <button
                onClick={() => {
                  setEditingProperty(null);
                  setIsModalOpen(true);
                }}
                className="px-4 py-2 bg-[#0BA6DF] text-white rounded flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                ثبت ملک جدید
              </button>
              
              <button
                onClick={onLogout}
                className="px-4 py-2 bg-[#DC143C] text-white rounded flex items-center gap-2"
              >
                <LogOut className="w-5 h-5" />
                خروج
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* بخش هدر */}
        <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                🏠 مدیریت آگهی‌های املاک
              </h1>
              <p className="text-gray-600 mt-2">
                شما در حال حاضر به عنوان مدیر وارد شده‌اید
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={fetchProperties}
                disabled={loading}
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                title="به‌روزرسانی لیست"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
              
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>آنلاین</span>
              </div>
            </div>
          </div>
        </div>

        {/* کارت‌های آمار */}
        <div className="grid mobile:grid-cols-1 tablet:grid-cols-2 laptop:grid-cols-4 gap-4 mb-6">
          <StatCard 
            icon={<Home className="w-6 h-6" />}
            title="کل آگهی‌ها"
            value={stats.total}
            change={`+${stats.recent} جدید`}
            color="blue"
          />
          
          <StatCard 
            title="آگهی فروش"
            value={stats.forSale}
            change={`${Math.round((stats.forSale / stats.total) * 100) || 0}%`}
            color="green"
          />
          
          <StatCard 
            icon={<Users className="w-6 h-6" />}
            title="آگهی اجاره"
            value={stats.forRent}
            change={`${Math.round((stats.forRent / stats.total) * 100) || 0}%`}
            color="purple"
          />
          
          <StatCard 
            icon={<TrendingUp className="w-6 h-6" />}
            title="با قیمت"
            value={stats.withPrice}
            change={`${Math.round((stats.withPrice / stats.total) * 100) || 0}%`}
            color="orange"
          />
        </div>

        {/* بخش فیلتر و جستجو */}
        <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-gray-800">
                لیست املاک ({filteredProperties.length})
              </h2>
              
              <button 
                onClick={fetchProperties}
                disabled={loading}
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                title="به‌روزرسانی لیست"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-2 text-sm"
              >
                <Filter className="w-4 h-4" />
                فیلترها
              </button>
              
              <button
                onClick={() => setShowEmptyPrices(!showEmptyPrices)}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-2 text-sm"
              >
                {showEmptyPrices ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showEmptyPrices ? 'پنهان‌کردن بدون قیمت' : 'نمایش بدون قیمت'}
              </button>
            </div>
          </div>

          {/* نوار جستجو */}
          <div className="relative mb-4">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="جستجو در عنوان، آدرس یا توضیحات..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
            />
          </div>

          {/* فیلترهای پیشرفته */}
          {showFilters && (
            <div className="bg-gray-50 rounded-lg p-4 mb-4 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    نوع معامله
                  </label>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                  >
                    <option value="all">همه انواع</option>
                    <option value="buy">فقط فروش</option>
                    <option value="rent">فقط اجاره</option>
                  </select>
                </div>
                
                <div className="md:col-span-2">
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => setTypeFilter('all')}
                      className={`px-4 py-2 rounded-lg text-sm ${typeFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                    >
                      همه ({properties.length})
                    </button>
                    <button
                      onClick={() => setTypeFilter('buy')}
                      className={`px-4 py-2 rounded-lg text-sm ${typeFilter === 'buy' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                    >
                      فروش ({stats.forSale})
                    </button>
                    <button
                      onClick={() => setTypeFilter('rent')}
                      className={`px-4 py-2 rounded-lg text-sm ${typeFilter === 'rent' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                    >
                      اجاره ({stats.forRent})
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* نمایش لیست properties */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto"></div>
            <p className="mt-4 text-gray-600">در حال بارگذاری آگهی‌ها...</p>
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow">
            <div className="text-5xl mb-4">🏡</div>
            <p className="text-gray-500 text-lg mb-2">آگهی‌ای یافت نشد</p>
            <p className="text-gray-400 text-sm mb-6">
              {searchQuery ? 'لطفاً جستجوی دیگری امتحان کنید' : 'هنوز ملکی ثبت نشده است'}
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setTypeFilter('all');
                setShowEmptyPrices(false);
              }}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              پاک‌کردن فیلترها
            </button>
          </div>
        ) : (
          <div className="grid mobile:grid-cols-1 tablet:grid-cols-2 laptop:grid-cols-3 desktop:grid-cols-4 gap-4 md:gap-6">
            {filteredProperties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onEdit={handleEdit}
                onDelete={handleDelete}
                getDealTypeText={getDealTypeText}
                renderPriceInfo={renderPriceInfo}
                formatPrice={formatPrice}
              />
            ))}
          </div>
        )}
      </div>

      {/* مودال */}
      <PropertyModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProperty(null);
        }}
        onSubmit={handleSubmit}
        initialData={editingProperty}
        isEditing={!!editingProperty}
      />
    </div>
  );
}

// کامپوننت کارت آمار
function StatCard({ icon, title, value, change, color }: any) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
    orange: 'bg-orange-50 border-orange-200 text-orange-700',
  };

  return (
    <div className={`${colorClasses[color as keyof typeof colorClasses]} border rounded-2xl p-5 hover:shadow-md transition-shadow`}>
      <div className="flex items-center justify-between mb-3">
        <div className="p-2 bg-white rounded-lg shadow-sm">
          {icon}
        </div>
        <span className={`text-sm font-medium ${change.startsWith('+') ? 'text-green-600' : 'text-blue-600'}`}>
          {change}
        </span>
      </div>
      <h3 className="text-2xl font-bold mb-1">{value.toLocaleString('fa-IR')}</h3>
      <p className="text-sm opacity-75">{title}</p>
    </div>
  );
}

// کامپوننت کارت ملک
function PropertyCard({ property, onEdit, onDelete, getDealTypeText, renderPriceInfo, formatPrice }: any) {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-200">
      <div className="relative h-40 sm:h-48">
        {property.images && property.images.length > 0 ? (
          <>
            {/* پس‌زمینه محو‌شده، برای پر کردن فضای خالی بدون برش زدن عکس اصلی */}
            <img
              src={property.images[0]}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover scale-110 blur-xl opacity-60"
            />
            <img
              src={property.images[0]}
              alt={property.title}
              className="relative w-full h-full object-contain"
              loading="lazy"
            />
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <span className="text-gray-400">🏠 بدون تصویر</span>
          </div>
        )}
        
        {/* تگ نوع معامله */}
        <div className="absolute top-2 left-2">
          <span className={`px-2 py-1 text-xs font-semibold rounded shadow ${
            property.type === 'buy' 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-blue-100 text-blue-800 border border-blue-200'
          }`}>
            {getDealTypeText(property.type)}
          </span>
        </div>
        
        {/* دکمه‌های عملیات */}
        <div className="absolute top-2 right-2 flex gap-2">
          <button
            onClick={() => onEdit(property)}
            className="p-1.5 bg-white/90 hover:bg-white text-blue-600 rounded-lg shadow hover:shadow-md transition-all"
            title="ویرایش"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          
          <button
            onClick={() => onDelete(property.id)}
            className="p-1.5 bg-white/90 hover:bg-white text-red-600 rounded-lg shadow hover:shadow-md transition-all"
            title="حذف"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-bold text-gray-800 mb-2 line-clamp-1" title={property.title}>
          {property.title}
        </h3>
        
        <div className="space-y-2 text-sm">
          {/* متراژ */}
          {property.meter > 0 && (
            <div className="flex items-center text-gray-600">
              <svg className="w-4 h-4 ml-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <span className="truncate">{property.meter} متر مربع</span>
            </div>
          )}
          
          {/* قیمت */}
          {renderPriceInfo(property)}
          
          {/* آدرس */}
          {property.address && (
            <div className="flex items-start text-gray-600 pt-2 border-t border-gray-100">
              <svg className="w-4 h-4 ml-1 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="truncate" title={property.address}>{property.address}</span>
            </div>
          )}
          
          {/* تاریخ */}
          <div className="pt-2 border-t border-gray-100 text-xs text-gray-400 flex justify-between">
            <span>{new Date(property.created_at).toLocaleDateString('fa-IR')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// استایل‌های CSS
const styles = `
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .animate-fadeIn {
    animation: fadeIn 0.3s ease-out;
  }
  
  /* بهبود اسکرول برای موبایل */
  @media (max-width: 640px) {
    .grid {
      gap: 0.75rem;
    }
  }
`;

// اضافه کردن استایل‌ها
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}