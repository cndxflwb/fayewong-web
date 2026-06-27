import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export type Lang = 'zh' | 'en';

interface LangContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
}

const translations: Record<string, Record<Lang, string>> = {
  // 导航
  'nav.timeline': { zh: '時間線', en: 'Timeline' },
  'nav.index': { zh: '索引', en: 'Index' },
  'nav.magazine': { zh: '雜誌', en: 'Magazine' },
  'nav.stats': { zh: '統計', en: 'Stats' },
  'nav.about': { zh: '關於', en: 'About' },
  'nav.search_placeholder': { zh: '搜索歌曲、專輯…', en: 'Search songs, albums…' },

  // 首页
  'home.title': { zh: '菲樂集', en: 'Faye Collection' },
  'home.songs': { zh: '首歌曲', en: 'Songs' },
  'home.albums': { zh: '張專輯', en: 'Albums' },
  'home.years': { zh: '個年份', en: 'Years' },
  'home.top_collab': { zh: '合作最多', en: 'Top Collaborator' },
  'home.timeline_title': { zh: '編年時間線', en: 'Chronological Timeline' },
  'home.scroll_hint': { zh: '← 左右滑動瀏覽時間線 →', en: '← Scroll to browse timeline →' },

  // 搜索
  'search.title': { zh: '搜索', en: 'Search' },
  'search.found': { zh: '找到', en: 'Found' },
  'search.results': { zh: '條結果', en: 'results' },
  'search.no_results': { zh: '沒有找到匹配的結果', en: 'No matching results found' },
  'search.view_all': { zh: '查看全部', en: 'View all' },
  'search.empty_hint': { zh: '輸入關鍵詞開始搜索', en: 'Enter keywords to search' },
  'search.empty_desc': { zh: '支持搜索歌曲名、專輯名、作曲人、歌詞片段（簡體輸入自動匹配繁體）', en: 'Search by song name, album, composer, or lyrics' },

  // 杂志
  'magazine.title': { zh: '雜誌封面館', en: 'Magazine Gallery' },
  'magazine.subtitle': { zh: '「沒有人能僭越她的空間 · 沒有人能界定她的面貌」', en: '"No one can usurp her space · No one can define her face"' },
  'magazine.years_count': { zh: '個年份', en: 'Years' },
  'magazine.magazines_count': { zh: '本雜誌', en: 'Magazines' },
  'magazine.scroll_hint': { zh: '← 滑動瀏覽 →', en: '← Scroll →' },

  // 通用
  'common.songs_unit': { zh: '首', en: '' },
  'common.albums_unit': { zh: '輯', en: 'albums' },
  'common.song': { zh: '歌曲', en: 'Song' },
  'common.album': { zh: '專輯', en: 'Album' },
  'common.person': { zh: '人物', en: 'Person' },

  // 关于
  'about.title': { zh: '關於', en: 'About' },

  // 统计
  'stats.title': { zh: '統計', en: 'Statistics' },

  // footer
  'footer.text': { zh: '菲樂集——王菲演唱歌曲編年 · 赤霓編', en: 'Faye Collection — Chronology of Faye Wong Songs · by Chini' },
};

const LangContext = createContext<LangContextType | undefined>(undefined);

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = localStorage.getItem('fayewong-lang');
    return (saved === 'en' || saved === 'zh') ? saved : 'zh';
  });

  useEffect(() => {
    localStorage.setItem('fayewong-lang', lang);
    document.documentElement.setAttribute('lang', lang === 'zh' ? 'zh-Hant' : 'en');
  }, [lang]);

  const setLang = (l: Lang) => setLangState(l);

  const t = (key: string): string => {
    return translations[key]?.[lang] || key;
  };

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLang must be used within LangProvider');
  return ctx;
}
