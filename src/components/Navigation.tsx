import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Search, Music2 } from 'lucide-react';

const navLinks = [
  { path: '/', label: '時間線' },
  { path: '/index/songs', label: '索引' },
  { path: '/search', label: '搜索' },
  { path: '/about', label: '關於' },
];

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-bg-dark/90 backdrop-blur-md border-b border-primary/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <Music2 className="w-6 h-6 text-primary group-hover:text-primary-light transition-colors" />
            <span className="text-xl font-bold text-primary font-serif tracking-wider">
              菲樂集
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location.pathname === link.path
                    ? 'text-primary'
                    : 'text-text-secondary'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/search"
              className="p-2 rounded-full hover:bg-primary/10 transition-colors"
            >
              <Search className="w-4 h-4 text-text-secondary" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-primary/10 transition-colors cursor-pointer"
          >
            {isOpen ? (
              <X className="w-5 h-5 text-text" />
            ) : (
              <Menu className="w-5 h-5 text-text" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-bg-dark/95 backdrop-blur-md border-t border-primary/10 animate-in slide-in-from-top-2">
          <div className="px-4 py-4 space-y-3">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === link.path
                    ? 'bg-primary/20 text-primary'
                    : 'text-text-secondary hover:bg-primary/10 hover:text-primary'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
