import React, { useState } from 'react';
import {
  Home,
  Activity,
  TrendingUp,
  User,
  Moon,
  Footprints,
  MessageCircle,
  Menu,
  X,
  ChevronDown
} from 'lucide-react';

interface TopNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  userName?: string;
}

export const TopNavigation: React.FC<TopNavigationProps> = ({
  activeTab,
  onTabChange,
  userName
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigationItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'activity', icon: Activity, label: 'Activity' },
    { id: 'progress', icon: TrendingUp, label: 'Progress' },
    { id: 'sleep', icon: Moon, label: 'Sleep' },
    { id: 'steps', icon: Footprints, label: 'Steps' },
    { id: 'chat', icon: MessageCircle, label: 'AI Chat' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <div className="flex-shrink-0 flex items-center">
            <h1 className="text-xl font-bold text-sky-600">Vita Navigator</h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:space-x-4">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === item.id
                    ? 'text-sky-600 bg-sky-50'
                    : 'text-gray-600 hover:text-sky-600 hover:bg-sky-50'
                }`}
              >
                <item.icon className="w-4 h-4 mr-2" />
                {item.label}
              </button>
            ))}

            {/* User Profile Button */}
            <button 
              onClick={() => onTabChange('profile')}
              className="ml-2 inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-sky-600 hover:bg-sky-50"
            >
              <User className="w-4 h-4 mr-2" />
              {userName || 'Profile'}
              <ChevronDown className="w-4 h-4 ml-1" />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-lg text-gray-600 hover:text-sky-600 hover:bg-sky-50 transition-colors"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <div
        className={`lg:hidden transition-all duration-300 ease-in-out ${
          isMenuOpen
            ? 'max-h-screen opacity-100 visible'
            : 'max-h-0 opacity-0 invisible'
        }`}
      >
        <div className="px-4 pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onTabChange(item.id);
                setIsMenuOpen(false);
              }}
              className={`w-full flex items-center px-3 py-2 rounded-lg text-base font-medium ${
                activeTab === item.id
                  ? 'text-sky-600 bg-sky-50'
                  : 'text-gray-600 hover:text-sky-600 hover:bg-sky-50'
              }`}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};