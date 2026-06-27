import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Search, Music2, Sun, Moon, Globe } from 'lucide-react';
import { search, highlightText } from '../lib/search';
import type { SearchResultItem } from '../lib/search';
import { useTheme } from '../contexts/ThemeContext';
import { useLang } from '../contexts/LangContext';

const navLinks = [
  { path: '/', labelKey: 'nav.timeline' },
  { path: '/index/songs', labelKey: 'nav.index' },
  { path: '/magazine', labelKey: 'nav.magazine' },
  { path: '/stats', labelKey: 'nav.stats' },
  { path: '/about', labelKey: 'nav.about' },
];

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(true);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const location = useLocation();
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { theme, toggleTheme } = useTheme();
  const { lang, setLang, t } = useLang();

  // 点击外部关闭搜索
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 路由变化时关闭搜索
  useEffect(() => {
    setSearchOpen(false);
    setQuery('');
    setResults([]);
  }, [location.pathname]);

  const handleSearch = useCallback((value: string) => {
    setQuery(value);
    if (value.trim().length >= 1) {
      setResults(search(value));
    } else {
      setResults([]);
    }
  }, []);

  const openSearch = () => {
    setSearchOpen(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const getLink = (item: SearchResultItem) => {
    switch (item.type) {
      case 'song': return `/song/${item.slug}`;
      case 'album': return `/album/${item.slug}`;
      default: return `/index/composers`;
    }
  };

  const renderHighlight = (text: string) => {
    if (!query.trim()) return text;
    const hl = highlightText(text, query);
    if (!hl) return text;
    return (
      <>
        {hl.before}
        <mark className="bg-primary/30 text-primary rounded px-0.5">{hl.match}</mark>
        {hl.after}
      </>
    );
  };

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
          <div className="hidden md:flex items-center gap-6">
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
                {t(link.labelKey)}
              </Link>
            ))}

            {/* 内联搜索框（始终展开） */}
            <div ref={searchRef} className="relative">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => handleSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') { setQuery(''); setResults([]); inputRef.current?.blur(); }
                    if (e.key === 'Enter' && query.trim()) {
                      navigate(`/search?q=${encodeURIComponent(query)}`);
                      setQuery(''); setResults([]);
                    }
                  }}
                  onFocus={() => setSearchOpen(true)}
                  placeholder={t('nav.search_placeholder')}
                  className="w-48 pl-8 pr-3 py-1.5 bg-bg-secondary/80 border border-primary/20 rounded-lg text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-primary/50 focus:w-56 transition-all"
                />
              </div>

              {/* 搜索结果下拉 */}
              {searchOpen && query.trim() && (
                <div className="absolute top-full right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-bg-dark border border-primary/20 rounded-xl shadow-2xl shadow-black/50 z-50">
                  {results.length > 0 ? (
                    <div className="py-2">
                      <p className="px-4 py-1 text-xs text-text-muted">
                        找到 {results.length} 條結果
                      </p>
                      {results.slice(0, 8).map((item, idx) => (
                        <Link
                          key={`${item.slug}-${idx}`}
                          to={getLink(item)}
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-primary/10 transition-colors"
                          onClick={() => { setQuery(''); setResults([]); }}
                        >
                          <span className="text-xs px-1.5 py-0.5 rounded bg-bg-secondary text-text-muted">
                            {item.type === 'song' ? '曲' : item.type === 'album' ? '輯' : '人'}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-text truncate">
                              {renderHighlight(item.title)}
                            </p>
                            {item.year && (
                              <span className="text-xs text-text-muted">{item.year}年</span>
                            )}
                          </div>
                        </Link>
                      ))}
                      {results.length > 8 && (
                        <Link
                          to={`/search?q=${encodeURIComponent(query)}`}
                          className="block px-4 py-2 text-xs text-primary hover:bg-primary/10 text-center border-t border-primary/10"
                          onClick={() => { setQuery(''); setResults([]); }}
                        >
                          查看全部 {results.length} 條結果 →
                        </Link>
                      )}
                    </div>
                  ) : (
                    <div className="px-4 py-6 text-center text-sm text-text-muted">
                      沒有找到匹配的結果
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 主题切换 */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-primary/10 transition-colors text-text-secondary hover:text-primary"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* 语言切换 */}
            <button
              onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-primary/10 transition-colors text-text-secondary hover:text-primary text-xs font-medium"
              title={lang === 'zh' ? 'Switch to English' : '切換為中文'}
            >
              <Globe className="w-4 h-4" />
              <span>{lang === 'zh' ? 'EN' : '中'}</span>
            </button>
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
        <div className="md:hidden bg-bg-dark/95 backdrop-blur-md border-t border-primary/10">
          <div className="px-4 py-4 space-y-3">
            {/* 移动端搜索框 */}
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && query.trim()) {
                    navigate(`/search?q=${encodeURIComponent(query)}`);
                    setIsOpen(false);
                    setQuery('');
                    setResults([]);
                  }
                }}
                placeholder={t('nav.search_placeholder')}
                className="w-full pl-10 pr-4 py-2.5 bg-bg-secondary/50 border border-primary/20 rounded-lg text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-primary/50 transition-all"
              />
            </div>
            {/* 移动端搜索结果 */}
            {query.trim() && results.length > 0 && (
              <div className="space-y-1 mb-2">
                {results.slice(0, 5).map((item, idx) => (
                  <Link
                    key={`${item.slug}-${idx}`}
                    to={getLink(item)}
                    onClick={() => { setIsOpen(false); setQuery(''); setResults([]); }}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-primary/10 transition-colors"
                  >
                    <span className="text-xs px-1.5 py-0.5 rounded bg-bg-secondary text-text-muted">
                      {item.type === 'song' ? '曲' : item.type === 'album' ? '輯' : '人'}
                    </span>
                    <span className="text-sm text-text truncate">{item.title}</span>
                  </Link>
                ))}
                {results.length > 5 && (
                  <Link
                    to={`/search?q=${encodeURIComponent(query)}`}
                    onClick={() => { setIsOpen(false); setQuery(''); setResults([]); }}
                    className="block px-3 py-2 text-xs text-primary text-center"
                  >
                    查看全部 {results.length} 條結果 →
                  </Link>
                )}
              </div>
            )}
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
                {t(link.labelKey)}
              </Link>
            ))}
            {/* 移动端主题/语言切换 */}
            <div className="flex items-center gap-3 px-4 pt-3 border-t border-primary/10">
              <button
                onClick={toggleTheme}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-primary/10 transition-colors text-text-secondary text-sm"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
              </button>
              <button
                onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-primary/10 transition-colors text-text-secondary text-sm"
              >
                <Globe className="w-4 h-4" />
                <span>{lang === 'zh' ? 'English' : '中文'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
