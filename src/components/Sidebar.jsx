import React, { useMemo } from 'react';
import { Home, Grid3X3, Package, ShoppingCart, Users, Settings, X, ChevronRight, LogOut } from 'lucide-react';

const Sidebar = React.memo(function Sidebar({ sidebarOpen, setSidebarOpen, currentRoute, setCurrentRoute }) {
  const sidebarItems = useMemo(() => ([
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'categories', label: 'Categories', icon: Grid3X3 },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]), []);

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              FoodAdmin
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-gray-600"
            aria-label="Close sidebar"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="mt-6 px-3">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentRoute === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentRoute(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center px-4 py-3 mb-2 text-left rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                <span className="font-medium">{item.label}</span>
                {isActive && <ChevronRight className="w-4 h-4 ml-auto text-white" />}
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-6 left-3 right-3">
          <button className="w-full flex items-center px-4 py-3 text-left rounded-xl text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all duration-200 group">
            <LogOut className="w-5 h-5 mr-3 text-gray-500 group-hover:text-red-500" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
});

export default Sidebar;
