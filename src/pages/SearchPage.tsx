import { useState, useCallback, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, Music, Disc3, User } from 'lucide-react';
import { search, highlightText } from '../lib/search';
import type { SearchResultItem } from '../lib/search';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function SearchPage() {
  useDocumentTitle('搜索');
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResultItem[]>([]);

  // 初始化时如果 URL 带有 q 参数，自动执行搜索
  useEffect(() => {
    if (initialQuery.trim().length >= 1) {
      setResults(search(initialQuery));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = useCallback((value: string) => {
    setQuery(value);
    // 同步更新 URL query param（replace 不产生新历史记录）
    if (value.trim()) {
      setSearchParams({ q: value }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
    if (value.trim().length >= 1) {
      const items = search(value);
      setResults(items);
    } else {
      setResults([]);
    }
  }, [setSearchParams]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'song': return <Music className="w-4 h-4 text-primary" />;
      case 'album': return <Disc3 className="w-4 h-4 text-accent-teal" />;
      case 'person': return <User className="w-4 h-4 text-accent-yellow" />;
      default: return <Music className="w-4 h-4 text-text-muted" />;
    }
  };

  const getLink = (item: SearchResultItem) => {
    switch (item.type) {
      case 'song': return `/song/${item.slug}`;
      case 'album': return `/album/${item.slug}`;
      default: return `/index/composers`;
    }
  };

  // 返回路径带上当前搜索词，确保返回时恢复搜索状态
  const getFromState = () => {
    const path = query.trim() ? `/search?q=${encodeURIComponent(query)}` : '/search';
    return { from: { label: '搜索結果', path } };
  };

  const renderHighlightedText = (text: string) => {
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
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold font-serif text-text mb-8 text-center">搜索</h1>

      {/* Search Input */}
      <div className="relative mb-10">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="搜索歌曲、專輯、作曲人、歌詞…（支持簡體輸入）"
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
            state={item.type === 'song' ? getFromState() : undefined}
            className="flex items-start gap-4 p-4 rounded-xl bg-bg-secondary/30 border border-primary/5 hover:border-primary/20 hover:bg-bg-secondary/60 transition-all group"
          >
            <div className="w-9 h-9 rounded-full bg-bg-dark flex items-center justify-center flex-shrink-0 mt-0.5">
              {getIcon(item.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-text group-hover:text-primary transition-colors">
                {renderHighlightedText(item.title)}
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
                <p className="text-xs text-text-muted mt-1.5 line-clamp-2 leading-relaxed">
                  {renderHighlightedText(item.excerpt)}
                </p>
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
            支持搜索歌曲名、專輯名、作曲人、歌詞片段（簡體輸入自動匹配繁體）
          </p>
        </div>
      )}
    </div>
  );
}
