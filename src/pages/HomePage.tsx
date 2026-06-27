import { useRef, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Music, Disc3, Calendar, Users } from 'lucide-react';
import { timeline, getTotalStats, songs } from '../lib/data';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function HomePage() {
  useDocumentTitle();
  const stats = getTotalStats();
  const timelineRef = useRef<HTMLDivElement>(null);

  // 统计合作最多的人（作曲+作词）
  const topCollaborator = useMemo(() => {
    const counter: Record<string, number> = {};
    for (const song of songs) {
      const people = [...song.composer, ...song.lyricist, ...song.arranger];
      for (const p of people) {
        if (p && p !== '王菲' && p !== 'Faye Wong') {
          counter[p] = (counter[p] || 0) + 1;
        }
      }
    }
    const sorted = Object.entries(counter).sort((a, b) => b[1] - a[1]);
    return sorted[0] ? { name: sorted[0][0], count: sorted[0][1] } : null;
  }, []);

  useEffect(() => {
    const el = timelineRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      }
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col overflow-hidden">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-8 lg:py-10 shrink-0">
        <div className="absolute inset-0 bg-gradient-to-b from-bg-dark via-bg to-bg-secondary" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary rounded-full blur-[128px]" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent-teal rounded-full blur-[96px]" />
        </div>
        <div className="relative max-w-5xl mx-auto px-4 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold font-serif text-primary mb-4 tracking-wider">
            菲樂集
          </h1>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            <div className="bg-bg-dark/50 backdrop-blur border border-primary/10 rounded-xl p-3 hover:border-primary/30 transition-colors">
              <Music className="w-5 h-5 text-primary mx-auto mb-1" />
              <div className="text-xl font-bold text-text">{stats.totalSongs}</div>
              <div className="text-xs text-text-muted">首歌曲</div>
            </div>
            <div className="bg-bg-dark/50 backdrop-blur border border-primary/10 rounded-xl p-3 hover:border-primary/30 transition-colors">
              <Disc3 className="w-5 h-5 text-accent-teal mx-auto mb-1" />
              <div className="text-xl font-bold text-text">{stats.totalAlbums}</div>
              <div className="text-xs text-text-muted">張專輯</div>
            </div>
            <div className="bg-bg-dark/50 backdrop-blur border border-primary/10 rounded-xl p-3 hover:border-primary/30 transition-colors">
              <Calendar className="w-5 h-5 text-accent-yellow mx-auto mb-1" />
              <div className="text-xl font-bold text-text">{stats.totalYears}</div>
              <div className="text-xs text-text-muted">個年份</div>
            </div>
            <div className="bg-bg-dark/50 backdrop-blur border border-primary/10 rounded-xl p-3 hover:border-primary/30 transition-colors">
              <Users className="w-5 h-5 text-accent-mint mx-auto mb-1" />
              <div className="text-base font-bold text-text truncate">{topCollaborator?.name}</div>
              <div className="text-xs text-text-muted">合作最多（{topCollaborator?.count}首）</div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline - Horizontal */}
      <section className="relative flex-1 flex flex-col justify-center overflow-hidden min-h-0">
        {/* 装饰光晕背景 */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary rounded-full blur-[128px]" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent-teal rounded-full blur-[96px]" />
        </div>

        <h2 className="relative text-xl font-bold text-text mb-6 text-center font-serif shrink-0">
          編年時間線
        </h2>

        <div className="relative flex-1 flex flex-col justify-center min-h-0">
          {/* Horizontal scrollable container */}
          <div
            ref={timelineRef}
            className="overflow-x-auto pb-4 scrollbar-thin">
            <div className="relative min-w-max px-12">
              {/* Horizontal line */}
              <div className="absolute left-0 right-0 top-1/2 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

              <div className="flex items-center gap-0">
                {timeline.map((entry, idx) => (
                  <Link
                    key={entry.year}
                    to={`/year/${entry.year}`}
                    className="group relative flex flex-col items-center"
                    style={{ minWidth: '120px' }}
                  >
                    {/* Top card (even index) or bottom card (odd index) */}
                    <div className={`flex flex-col items-center ${idx % 2 === 0 ? 'flex-col' : 'flex-col-reverse'}`}>
                      {/* Content Card */}
                      <div className={`w-28 ${idx % 2 === 0 ? 'mb-3' : 'mt-3'}`}>
                        <div className="bg-bg-secondary/50 border border-primary/10 rounded-lg p-3 hover:border-primary/30 hover:bg-bg-secondary/80 transition-all group-hover:shadow-lg group-hover:shadow-primary/5 text-center">
                          <span className="text-xs text-text-muted block">
                            {entry.songCount} 首
                          </span>
                          {entry.albums.length > 0 && (
                            <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full mt-1 inline-block">
                              {entry.albums.length} 輯
                            </span>
                          )}
                          {entry.albums.length > 0 && (
                            <div className="mt-1.5">
                              <p className="text-xs text-text-secondary truncate">
                                {entry.albums[0].title}
                              </p>
                              {entry.albums.length > 1 && (
                                <p className="text-xs text-text-muted">
                                  +{entry.albums.length - 1}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Connector line */}
                      <div className={`w-px h-6 bg-primary/30 group-hover:bg-primary/60 transition-colors`} />

                      {/* Year Node */}
                      <div className="w-11 h-11 rounded-full bg-bg-dark border-2 border-primary/40 flex items-center justify-center group-hover:border-primary group-hover:shadow-lg group-hover:shadow-primary/20 transition-all flex-shrink-0 z-10">
                        <span className="text-[10px] font-bold text-primary leading-none">
                          {entry.year}
                        </span>
                      </div>

                      {/* Connector line (other side) */}
                      <div className={`w-px h-6 bg-transparent`} />

                      {/* Empty spacer to balance layout */}
                      <div className="w-28 h-0" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Scroll hint */}
          <div className="text-center mt-2 shrink-0">
            <span className="text-xs text-text-muted">← 左右滑動瀏覽時間線 →</span>
          </div>
        </div>
      </section>
    </div>
  );
}
