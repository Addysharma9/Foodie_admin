import React from 'react';
import { Menu, Search, Bell } from 'lucide-react';

const Header = React.memo(function Header({ setSidebarOpen, currentRoute, searchTerm, setSearchTerm }) {
  return (
    <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-500 hover:text-gray-700 transition-colors"
              aria-label="Open sidebar"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 capitalize">
                {currentRoute === 'dashboard' ? 'Dashboard' : currentRoute}
              </h1>
              <p className="text-sm text-gray-500">
                {currentRoute === 'dashboard'
                  ? "Welcome back! Here's what's happening."
                  : `Manage your ${currentRoute}`}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative hidden sm:block">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-64 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors" aria-label="Notifications">
              <Bell className="w-6 h-6" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-semibold">A</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default Header;
