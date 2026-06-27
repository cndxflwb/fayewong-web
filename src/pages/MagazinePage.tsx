import { useState, useEffect, useCallback, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import magazineData from '../../data/magazines.json';

interface MagazineItem {
  id: number;
  date: string;
  issue: string;
  name: string;
  title: string;
  cover: string;
}

interface MagazineData {
  years: Record<string, MagazineItem[]>;
}

const data = magazineData as MagazineData;
const BASE = import.meta.env.BASE_URL;

export default function MagazinePage() {
  useDocumentTitle('雜誌封面館');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentYear, setCurrentYear] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeNavYear, setActiveNavYear] = useState<string>('');
  const navRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const years = Object.keys(data.years).sort();
  const totalCount = Object.values(data.years).reduce((sum, items) => sum + items.length, 0);

  // 时间线鼠标滚轮横向滚动
  useEffect(() => {
    const el = navRef.current;
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

  // 监听滚动高亮当前年份
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const year = entry.target.getAttribute('data-year');
            if (year) setActiveNavYear(year);
          }
        });
      },
      { rootMargin: '-120px 0px -60% 0px' }
    );

    years.forEach((year) => {
      const el = document.getElementById(`mag-year-${year}`);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [years]);

  // 当高亮年份变化时，自动滚动时间线使对应节点可见
  useEffect(() => {
    if (!activeNavYear || !navRef.current) return;
    const idx = years.indexOf(activeNavYear);
    if (idx < 0) return;
    const nodeCenter = idx * 80 + 40 + 32;
    const container = navRef.current;
    const scrollTarget = nodeCenter - container.clientWidth / 2;
    container.scrollTo({ left: scrollTarget, behavior: 'smooth' });
  }, [activeNavYear, years]);

  // 打开/关闭 dialog + 锁定背景滚动
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (lightboxOpen) {
      dialog.showModal();
      document.body.style.overflow = 'hidden';
    } else {
      dialog.close();
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [lightboxOpen]);

  // dialog 原生关闭事件（Escape 键）
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onClose = () => setLightboxOpen(false);
    dialog.addEventListener('close', onClose);
    return () => dialog.removeEventListener('close', onClose);
  }, []);



  // 键盘左右切换
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!lightboxOpen || !currentYear) return;
      const items = data.years[currentYear];
      if (e.key === 'ArrowLeft' && currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
      } else if (e.key === 'ArrowRight' && currentIndex < items.length - 1) {
        setCurrentIndex(currentIndex + 1);
      }
    },
    [lightboxOpen, currentYear, currentIndex]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // 移动端触摸滑动（原生事件绑定到 dialog）
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !lightboxOpen) return;

    let startX = 0;
    let moved = false;

    const onTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      moved = false;
    };
    const onTouchMove = () => { moved = true; };
    const onTouchEnd = (e: TouchEvent) => {
      if (!moved || !currentYear) return;
      const diff = startX - e.changedTouches[0].clientX;
      const items = data.years[currentYear];
      if (Math.abs(diff) < 50) return;
      if (diff > 0 && currentIndex < items.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else if (diff < 0 && currentIndex > 0) {
        setCurrentIndex(prev => prev - 1);
      }
    };

    dialog.addEventListener('touchstart', onTouchStart, { passive: true });
    dialog.addEventListener('touchmove', onTouchMove, { passive: true });
    dialog.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      dialog.removeEventListener('touchstart', onTouchStart);
      dialog.removeEventListener('touchmove', onTouchMove);
      dialog.removeEventListener('touchend', onTouchEnd);
    };
  }, [lightboxOpen, currentYear, currentIndex]);

  const openLightbox = (year: string, index: number) => {
    setCurrentYear(year);
    setCurrentIndex(index);
    setLightboxOpen(true);
  };

  const currentItem = currentYear ? data.years[currentYear]?.[currentIndex] : null;

  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      <section className="relative h-[40vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-bg-dark via-bg to-bg-secondary" />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary rounded-full blur-[128px] opacity-10" />
        <div className="absolute bottom-1/4 right-1/3 w-48 h-48 bg-accent-teal rounded-full blur-[96px] opacity-10" />
        <div className="relative z-10 text-center px-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <BookOpen className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl lg:text-6xl font-bold font-serif text-primary tracking-wider mb-4">
            雜誌封面館
          </h1>
          <p className="text-lg lg:text-xl text-text-secondary font-light italic">
            「沒有人能僭越她的空間 · 沒有人能界定她的面貌」
          </p>
          <div className="mt-6 flex items-center justify-center gap-6 text-sm text-text-muted">
            <span>{years.filter(y => y !== '未知').length} 個年份</span>
            <span className="w-1 h-1 rounded-full bg-primary/40" />
            <span>{totalCount} 本雜誌</span>
            <span className="w-1 h-1 rounded-full bg-primary/40" />
            <span>1988 — 2025</span>
          </div>
        </div>
      </section>

      {/* 时间轴导航 - 与主站风格一致 */}
      <nav className="sticky top-16 z-40 bg-bg-dark/90 backdrop-blur-md border-b border-primary/10">
        <div className="relative">
          <div
            ref={navRef}
            className="overflow-x-auto py-6 scrollbar-thin"
          >
            <div className="relative min-w-max px-8">
              {/* 水平连接线 */}
              <div className="absolute left-0 right-0 top-1/2 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

              <div className="flex items-center gap-0">
                {years.map((year) => (
                  <a
                    key={year}
                    href={`#mag-year-${year}`}
                    className="group relative flex flex-col items-center"
                    style={{ minWidth: '80px' }}
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById(`mag-year-${year}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                  >
                    {/* 数量标签 */}
                    <div className={`mb-2 transition-all ${
                      activeNavYear === year ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`}>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20">
                        {data.years[year].length} 本
                      </span>
                    </div>

                    {/* 连接线 */}
                    <div className={`w-px h-3 transition-colors ${
                      activeNavYear === year ? 'bg-primary/60' : 'bg-primary/20 group-hover:bg-primary/40'
                    }`} />

                    {/* 圆形年份节点 */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all z-10 ${
                      activeNavYear === year
                        ? 'bg-bg-dark border-2 border-primary shadow-lg shadow-primary/20 scale-110'
                        : 'bg-bg-dark border-2 border-primary/30 group-hover:border-primary group-hover:shadow-lg group-hover:shadow-primary/20'
                    }`}>
                      <span className={`text-[10px] font-bold leading-none transition-colors ${
                        activeNavYear === year ? 'text-primary' : 'text-text-muted group-hover:text-primary'
                      }`}>
                        {year}
                      </span>
                    </div>

                    {/* 下方连接线 */}
                    <div className={`w-px h-3 transition-colors ${
                      activeNavYear === year ? 'bg-primary/60' : 'bg-transparent'
                    }`} />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* 滚动提示 */}
          <div className="absolute bottom-1 left-0 right-0 text-center pointer-events-none">
            <span className="text-[10px] text-text-muted/50">← 滑動瀏覽 →</span>
          </div>
        </div>
      </nav>

      {/* 杂志内容 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {years.map((year) => (
          <section
            key={year}
            id={`mag-year-${year}`}
            data-year={year}
            className="mb-16"
          >
            {/* 年份标题 */}
            <div className="flex items-center gap-4 mb-6">
              <h2 className="text-2xl font-bold font-serif text-text">
                {year}
              </h2>
              <span className="text-sm text-text-muted bg-bg-dark/50 px-3 py-1 rounded-full border border-primary/10">
                {data.years[year].length} 本
              </span>
              <div className="flex-1 h-px bg-gradient-to-r from-primary/30 to-transparent" />
            </div>

            {/* 杂志网格 */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {data.years[year].map((item, index) => (
                <div
                  key={item.id}
                  className="group cursor-pointer"
                  onClick={() => openLightbox(year, index)}
                >
                  <div className="relative overflow-hidden rounded-lg bg-bg-dark border border-primary/10 hover:border-primary/30 transition-all hover:shadow-lg hover:shadow-primary/5 h-[240px]">
                    <img
                      src={`${BASE}magazine-images/${item.cover.replace(/\.(jpg|jpeg|png)$/i, '.webp')}`}
                      alt={item.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  </div>
                  <div className="mt-2 px-1">
                    <h3 className="text-xs font-medium text-text truncate">
                      {item.name}
                    </h3>
                    <p className="text-xs text-text-muted truncate">
                      {item.date}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </main>

      {/* Lightbox - 使用原生 dialog 元素 */}
      <dialog
        ref={dialogRef}
        className="lightbox-dialog fixed inset-0 w-screen h-screen max-w-none max-h-none m-0 p-0 bg-transparent z-[100]"
      >
        {/* backdrop 层 - 点击关闭 */}
        <div
          className="absolute inset-0 bg-black/95 backdrop-blur-sm"
          onClick={() => setLightboxOpen(false)}
        />
        {currentItem && currentYear && (
          <div className="relative z-10 w-full h-full flex flex-col items-center justify-center pointer-events-none">
            {/* 关闭按钮 */}
            <button
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer z-10 pointer-events-auto"
              onClick={() => setLightboxOpen(false)}
            >
              <X className="w-6 h-6 text-white" />
            </button>

            {/* 上一张 */}
            {currentIndex > 0 && (
              <button
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer z-10 pointer-events-auto"
                onClick={() => setCurrentIndex(currentIndex - 1)}
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>
            )}

            {/* 下一张 */}
            {currentIndex < data.years[currentYear].length - 1 && (
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer z-10 pointer-events-auto"
                onClick={() => setCurrentIndex(currentIndex + 1)}
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>
            )}

            {/* 主图 */}
            <img
              src={`${BASE}magazine-images/${currentItem.cover.replace(/\.(jpg|jpeg|png)$/i, '.webp')}`}
              alt={currentItem.title}
              className="max-h-[70vh] max-w-[85vw] object-contain rounded-lg shadow-2xl select-none pointer-events-auto"
              draggable={false}
            />

            {/* 图片信息 */}
            <div className="mt-4 text-center px-4">
              <p className="text-white text-sm font-medium">
                {currentItem.name} {currentItem.issue}
              </p>
              <p className="text-white/60 text-xs mt-1">
                {currentItem.date} · {currentItem.title}
              </p>
              <p className="text-white/40 text-xs mt-2">
                {currentIndex + 1} / {data.years[currentYear].length}
              </p>
            </div>

            {/* 缩略图条 */}
            <div className="mt-4 flex gap-2 overflow-x-auto max-w-[90vw] px-4 py-2 scrollbar-thin pointer-events-auto">
              {data.years[currentYear].map((item, i) => (
                <img
                  key={item.id}
                  src={`${BASE}magazine-images/${item.cover.replace(/\.(jpg|jpeg|png)$/i, '.webp')}`}
                  alt={item.title}
                  className={`w-12 h-16 object-cover rounded cursor-pointer transition-all flex-shrink-0 ${
                    i === currentIndex
                      ? 'ring-2 ring-primary scale-110'
                      : 'opacity-50 hover:opacity-80'
                  }`}
                  onClick={() => setCurrentIndex(i)}
                />
              ))}
            </div>
          </div>
        )}
      </dialog>
    </div>
  );
}
