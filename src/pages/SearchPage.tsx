import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search as SearchIcon, Music, Disc3, User } from 'lucide-react';
import { search } from '../lib/search';
import type { SearchItem } from '../types';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchItem[]>([]);

  const handleSearch = useCallback((value: string) => {
    setQuery(value);
    if (value.trim().length >= 1) {
      const items = search(value);
      setResults(items);
    } else {
      setResults([]);
    }
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'song': return <Music className="w-4 h-4 text-primary" />;
      case 'album': return <Disc3 className="w-4 h-4 text-accent-teal" />;
      case 'person': return <User className="w-4 h-4 text-accent-yellow" />;
      default: return <Music className="w-4 h-4 text-text-muted" />;
    }
  };

  const getLink = (item: SearchItem) => {
    switch (item.type) {
      case 'song': return `/song/${item.slug}`;
      case 'album': return `/album/${item.slug}`;
      default: return `/index/composers`;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold font-serif text-text mb-8 text-center">搜索</h1>

      {/* Search Input */}
      <div className="relative mb-10">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="搜索歌曲、專輯、作曲人、作詞人..."
          className="w-full pl-12 pr-4 py-4 bg-bg-secondary/50 border border-primary/20 rounded-xl text-text placeholder:text-text-muted focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all text-lg"
          autoFocus
        />
      </div>

      {/* Results */}
      {query && (
        <div className="mb-4">
          <p className="text-sm text-text-muted">
            {results.length > 0
              ? `找到 ${results.length} 條結果`
              : '沒有找到匹配的結果'}
          </p>
        </div>
      )}

      <div className="space-y-2">
        {results.map((item, idx) => (
          <Link
            key={`${item.slug}-${idx}`}
            to={getLink(item)}
            className="flex items-start gap-4 p-4 rounded-xl bg-bg-secondary/30 border border-primary/5 hover:border-primary/20 hover:bg-bg-secondary/60 transition-all group"
          >
            <div className="w-9 h-9 rounded-full bg-bg-dark flex items-center justify-center flex-shrink-0 mt-0.5">
              {getIcon(item.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-text group-hover:text-primary transition-colors">
                {item.title}
              </p>
              <div className="flex items-center gap-3 mt-1">
                {item.year && (
                  <span className="text-xs text-text-muted">{item.year}年</span>
                )}
                {item.album && (
                  <span className="text-xs text-text-muted">{item.album}</span>
                )}
                <span className="text-xs px-2 py-0.5 rounded-full bg-bg-dark text-text-muted capitalize">
                  {item.type === 'song' ? '歌曲' : item.type === 'album' ? '專輯' : '人物'}
                </span>
              </div>
              {item.excerpt && (
                <p className="text-xs text-text-muted mt-1 line-clamp-1">{item.excerpt}</p>
              )}
            </div>
          </Link>
        ))}
      </div>

      {/* Empty State */}
      {!query && (
        <div className="text-center py-16">
          <SearchIcon className="w-16 h-16 text-primary/10 mx-auto mb-4" />
          <p className="text-text-muted">輸入關鍵詞開始搜索</p>
          <p className="text-text-muted/60 text-sm mt-2">
            支持搜索歌曲名、專輯名、作曲人、作詞人等
          </p>
        </div>
      )}
    </div>
  );
}
