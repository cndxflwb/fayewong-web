import Fuse from 'fuse.js';
import { searchIndex, songs } from './data';
import type { SearchItem } from '../types';

// 简繁对照表（常用字）
const s2tMap: Record<string, string> = {
  '爱':'愛','梦':'夢','风':'風','云':'雲','飞':'飛','鸟':'鳥','龙':'龍',
  '时':'時','间':'間','关':'關','门':'門','开':'開','东':'東','车':'車',
  '长':'長','马':'馬','鱼':'魚','见':'見','贝':'貝','书':'書','学':'學',
  '乐':'樂','电':'電','话':'話','说':'說','语':'語','认':'認','识':'識',
  '让':'讓','请':'請','谁':'誰','对':'對','过':'過','还':'還','这':'這',
  '进':'進','远':'遠','运':'運','连':'連','边':'邊','达':'達','迟':'遲',
  '选':'選','没':'沒','泪':'淚','海':'海','满':'滿','温':'溫','热':'熱',
  '灯':'燈','点':'點','烟':'煙','然':'然','心':'心','想':'想','情':'情',
  '忆':'憶','怀':'懷','恋':'戀','悲':'悲','惊':'驚','离':'離','难':'難',
  '头':'頭','脸':'臉','眼':'眼','听':'聽','声':'聲','歌':'歌','唱':'唱',
  '红':'紅','绿':'綠','蓝':'藍','黄':'黃','黑':'黑','白':'白','亮':'亮',
  '天':'天','地':'地','日':'日','月':'月','星':'星','光':'光','花':'花',
  '树':'樹','草':'草','春':'春','夏':'夏','秋':'秋','冬':'冬','雪':'雪',
  '雨':'雨','水':'水','山':'山','石':'石','金':'金','银':'銀','铁':'鐵',
  '钟':'鐘','镜':'鏡','窗':'窗','楼':'樓','城':'城','国':'國','家':'家',
  '人':'人','女':'女','男':'男','孩':'孩','儿':'兒','岁':'歲','年':'年',
  '来':'來','去':'去','走':'走','跑':'跑','回':'回','给':'給','带':'帶',
  '手':'手','脚':'腳','身':'身','影':'影','像':'像','画':'畫','写':'寫',
  '读':'讀','字':'字','纸':'紙','笔':'筆','色':'色','美':'美','丽':'麗',
  '旧':'舊','新':'新','轻':'輕','重':'重','高':'高','低':'低','深':'深',
  '浅':'淺','快':'快','慢':'慢','静':'靜','动':'動','安':'安','危':'危',
  '苦':'苦','甜':'甜','酸':'酸','冷':'冷','暖':'暖','凉':'涼','伤':'傷',
  '痛':'痛','哭':'哭','笑':'笑','忘':'忘','记':'記','知':'知','道':'道',
  '路':'路','桥':'橋','船':'船','翼':'翼','空':'空','阳':'陽','阴':'陰',
  '晴':'晴','暗':'暗','明':'明','夜':'夜','晚':'晚','早':'早','午':'午',
  '后':'後','前':'前','左':'左','右':'右','上':'上','下':'下','里':'裡',
  '外':'外','中':'中','内':'內','大':'大','小':'小','多':'多','少':'少',
  '全':'全','半':'半','双':'雙','单':'單','只':'隻','个':'個','两':'兩',
  '几':'幾','千':'千','万':'萬','百':'百','十':'十','一':'一','二':'二',
  '三':'三','四':'四','五':'五','六':'六','七':'七','八':'八','九':'九',
  '零':'零','能':'能','会':'會','可':'可','要':'要','应':'應','该':'該',
  '必':'必','须':'須','得':'得','把':'把','被':'被','从':'從','到':'到',
  '在':'在','有':'有','无':'無','是':'是','不':'不','也':'也','都':'都',
  '很':'很','太':'太','最':'最','更':'更','比':'比','和':'和','与':'與',
  '或':'或','但':'但','却':'卻','因':'因','为':'為','所':'所','以':'以',
};

// 简体转繁体（粗略转换用于搜索匹配）
function s2t(str: string): string {
  return str.split('').map(ch => s2tMap[ch] || ch).join('');
}

const fuse = new Fuse(searchIndex, {
  keys: [
    { name: 'title', weight: 2 },
    { name: 'excerpt', weight: 1 },
    { name: 'album', weight: 0.5 },
  ],
  threshold: 0.3,
  includeScore: true,
  includeMatches: true,
  minMatchCharLength: 1,
});

export interface SearchResultItem extends SearchItem {
  highlightedExcerpt?: string;
}

export function search(query: string): SearchResultItem[] {
  if (!query.trim()) return [];

  // 同时用简体原文和转繁体搜索，合并结果
  const results1 = fuse.search(query, { limit: 50 });
  const tQuery = s2t(query);
  const results2 = tQuery !== query ? fuse.search(tQuery, { limit: 50 }) : [];

  // 合并去重
  const seen = new Set<string>();
  const merged: SearchResultItem[] = [];

  for (const r of [...results1, ...results2]) {
    const key = `${r.item.type}-${r.item.slug}`;
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(r.item);
  }

  // 歌词搜索：在 songs 中搜索歌词匹配
  const lyricsResults = searchLyrics(query, tQuery);
  for (const item of lyricsResults) {
    const key = `song-${item.slug}`;
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(item);
  }

  return merged.slice(0, 60);
}

function searchLyrics(query: string, tQuery: string): SearchResultItem[] {
  const results: SearchResultItem[] = [];
  const lowerQuery = query.toLowerCase();
  const lowerTQuery = tQuery.toLowerCase();

  for (const song of songs) {
    if (!song.lyrics) continue;
    const lyricsLower = song.lyrics.toLowerCase();
    let matchIdx = lyricsLower.indexOf(lowerQuery);
    if (matchIdx === -1 && lowerTQuery !== lowerQuery) {
      matchIdx = lyricsLower.indexOf(lowerTQuery);
    }
    if (matchIdx === -1) continue;

    // 提取匹配片段上下文
    const contextStart = Math.max(0, matchIdx - 15);
    const contextEnd = Math.min(song.lyrics.length, matchIdx + query.length + 30);
    const snippet = (contextStart > 0 ? '…' : '') +
      song.lyrics.slice(contextStart, contextEnd).replace(/\n/g, ' ') +
      (contextEnd < song.lyrics.length ? '…' : '');

    results.push({
      type: 'song',
      title: song.title,
      slug: song.slug,
      year: song.year,
      album: song.albumTitle || undefined,
      excerpt: snippet,
      highlightedExcerpt: snippet,
    });
  }

  return results;
}

// 高亮匹配文本
export function highlightText(text: string, query: string): { before: string; match: string; after: string } | null {
  if (!query || !text) return null;
  const tQuery = s2t(query);
  const lowerText = text.toLowerCase();
  let idx = lowerText.indexOf(query.toLowerCase());
  if (idx === -1) idx = lowerText.indexOf(tQuery.toLowerCase());
  if (idx === -1) return null;

  return {
    before: text.slice(0, idx),
    match: text.slice(idx, idx + query.length),
    after: text.slice(idx + query.length),
  };
}
