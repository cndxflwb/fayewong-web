import { useMemo } from 'react';
import { BarChart3 } from 'lucide-react';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, Area, AreaChart
} from 'recharts';
import { timeline } from '../lib/data';
import magazineData from '../../data/magazines.json';

interface MagazineData {
  years: Record<string, { id: number; date: string; issue: string; name: string; title: string; cover: string }[]>;
}

const magData = magazineData as MagazineData;

export default function StatsPage() {
  useDocumentTitle('數據統計');
  // 歌曲数据：按年统计歌曲数和专辑数
  const songStats = useMemo(() => {
    return timeline
      .map(entry => ({
        year: String(entry.year),
        songs: entry.songCount,
        albums: entry.albums.length,
      }))
      .sort((a, b) => Number(a.year) - Number(b.year));
  }, []);

  // 杂志数据：按年统计
  const magazineStats = useMemo(() => {
    return Object.entries(magData.years)
      .filter(([year]) => year !== '未知')
      .map(([year, items]) => ({
        year,
        magazines: items.length,
      }))
      .sort((a, b) => Number(a.year) - Number(b.year));
  }, []);

  // 汇总
  const totalSongs = songStats.reduce((s, d) => s + d.songs, 0);
  const totalAlbums = songStats.reduce((s, d) => s + d.albums, 0);
  const totalMagazines = magazineStats.reduce((s, d) => s + d.magazines, 0);

  const peakSongYear = songStats.reduce((max, d) => d.songs > max.songs ? d : max, songStats[0]);
  const peakMagYear = magazineStats.reduce((max, d) => d.magazines > max.magazines ? d : max, magazineStats[0]);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative h-[32vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-bg-dark via-bg to-bg-secondary" />
        <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-primary rounded-full blur-[128px] opacity-10" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-accent-teal rounded-full blur-[96px] opacity-10" />
        <div className="relative z-10 text-center px-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <BarChart3 className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold font-serif text-primary tracking-wider mb-3">
            數據統計
          </h1>
          <p className="text-base text-text-secondary font-light">
            歌曲與雜誌的編年數據一覽
          </p>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {/* === 歌曲统计 === */}
        <section>
          <div className="flex items-center gap-4 mb-8">
            <h2 className="text-2xl font-bold font-serif text-text">歌曲統計</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-primary/30 to-transparent" />
          </div>

          {/* 概览卡片 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard label="歌曲總數" value={totalSongs} suffix="首" />
            <StatCard label="專輯總數" value={totalAlbums} suffix="張" />
            <StatCard label="跨越年份" value={songStats.length} suffix="年" />
            <StatCard label="最高產年份" value={peakSongYear?.year} subtitle={`${peakSongYear?.songs} 首`} />
          </div>

          {/* 歌曲折线图 */}
          <div className="bg-bg-dark/50 border border-primary/10 rounded-xl p-6">
            <h3 className="text-sm font-medium text-text-secondary mb-4">每年發行歌曲數量</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={songStats} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="songGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(212,175,55,0.1)" />
                  <XAxis
                    dataKey="year"
                    tick={{ fill: '#9ca3af', fontSize: 11 }}
                    axisLine={{ stroke: 'rgba(212,175,55,0.2)' }}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fill: '#9ca3af', fontSize: 11 }}
                    axisLine={{ stroke: 'rgba(212,175,55,0.2)' }}
                  />
                  <Tooltip content={<SongTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="songs"
                    stroke="#D4AF37"
                    strokeWidth={2}
                    fill="url(#songGradient)"
                    dot={{ fill: '#D4AF37', r: 3, strokeWidth: 0 }}
                    activeDot={{ r: 6, fill: '#D4AF37', stroke: '#0D1117', strokeWidth: 2 }}
                    name="歌曲"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 专辑折线图 */}
          <div className="bg-bg-dark/50 border border-primary/10 rounded-xl p-6 mt-6">
            <h3 className="text-sm font-medium text-text-secondary mb-4">每年發行專輯數量</h3>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={songStats} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="albumGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#5EEAD4" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#5EEAD4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(94,234,212,0.1)" />
                  <XAxis
                    dataKey="year"
                    tick={{ fill: '#9ca3af', fontSize: 11 }}
                    axisLine={{ stroke: 'rgba(94,234,212,0.2)' }}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fill: '#9ca3af', fontSize: 11 }}
                    axisLine={{ stroke: 'rgba(94,234,212,0.2)' }}
                  />
                  <Tooltip content={<AlbumTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="albums"
                    stroke="#5EEAD4"
                    strokeWidth={2}
                    fill="url(#albumGradient)"
                    dot={{ fill: '#5EEAD4', r: 3, strokeWidth: 0 }}
                    activeDot={{ r: 6, fill: '#5EEAD4', stroke: '#0D1117', strokeWidth: 2 }}
                    name="專輯"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 歌曲+专辑合并对比图 */}
          <div className="bg-bg-dark/50 border border-primary/10 rounded-xl p-6 mt-6">
            <h3 className="text-sm font-medium text-text-secondary mb-4">歌曲 vs 專輯 對比</h3>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={songStats} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(212,175,55,0.08)" />
                  <XAxis
                    dataKey="year"
                    tick={{ fill: '#9ca3af', fontSize: 11 }}
                    axisLine={{ stroke: 'rgba(212,175,55,0.2)' }}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fill: '#9ca3af', fontSize: 11 }}
                    axisLine={{ stroke: 'rgba(212,175,55,0.2)' }}
                  />
                  <Tooltip content={<CombinedTooltip />} />
                  <Legend
                    wrapperStyle={{ paddingTop: '12px' }}
                    formatter={(value) => <span className="text-xs text-text-secondary">{value}</span>}
                  />
                  <Line
                    type="monotone"
                    dataKey="songs"
                    stroke="#D4AF37"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 5, fill: '#D4AF37' }}
                    name="歌曲"
                  />
                  <Line
                    type="monotone"
                    dataKey="albums"
                    stroke="#5EEAD4"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 5, fill: '#5EEAD4' }}
                    name="專輯"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* === 杂志统计 === */}
        <section>
          <div className="flex items-center gap-4 mb-8">
            <h2 className="text-2xl font-bold font-serif text-text">雜誌統計</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-accent-teal/30 to-transparent" />
          </div>

          {/* 概览卡片 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard label="雜誌總數" value={totalMagazines} suffix="本" color="teal" />
            <StatCard label="跨越年份" value={magazineStats.length} suffix="年" color="teal" />
            <StatCard label="最高產年份" value={peakMagYear?.year} subtitle={`${peakMagYear?.magazines} 本`} color="teal" />
            <StatCard
              label="年均數量"
              value={Math.round(totalMagazines / magazineStats.length)}
              suffix="本"
              color="teal"
            />
          </div>

          {/* 杂志折线图 */}
          <div className="bg-bg-dark/50 border border-primary/10 rounded-xl p-6">
            <h3 className="text-sm font-medium text-text-secondary mb-4">每年雜誌封面數量</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={magazineStats} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="magGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#A78BFA" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#A78BFA" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(167,139,250,0.1)" />
                  <XAxis
                    dataKey="year"
                    tick={{ fill: '#9ca3af', fontSize: 11 }}
                    axisLine={{ stroke: 'rgba(167,139,250,0.2)' }}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fill: '#9ca3af', fontSize: 11 }}
                    axisLine={{ stroke: 'rgba(167,139,250,0.2)' }}
                  />
                  <Tooltip content={<MagTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="magazines"
                    stroke="#A78BFA"
                    strokeWidth={2}
                    fill="url(#magGradient)"
                    dot={{ fill: '#A78BFA', r: 3, strokeWidth: 0 }}
                    activeDot={{ r: 6, fill: '#A78BFA', stroke: '#0D1117', strokeWidth: 2 }}
                    name="雜誌"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

/* --- 子组件 --- */

function StatCard({ label, value, suffix, subtitle, color = 'primary' }: {
  label: string;
  value: string | number;
  suffix?: string;
  subtitle?: string;
  color?: 'primary' | 'teal';
}) {
  const borderColor = color === 'teal' ? 'border-accent-teal/20 hover:border-accent-teal/40' : 'border-primary/10 hover:border-primary/30';
  const iconColor = color === 'teal' ? 'text-accent-teal' : 'text-primary';

  return (
    <div className={`bg-bg-dark/50 backdrop-blur border ${borderColor} rounded-xl p-4 transition-colors`}>
      <div className="text-xs text-text-muted mb-1">{label}</div>
      <div className="flex items-baseline gap-1">
        <span className={`text-2xl font-bold ${iconColor}`}>{value}</span>
        {suffix && <span className="text-xs text-text-muted">{suffix}</span>}
      </div>
      {subtitle && <div className="text-xs text-text-muted mt-1">{subtitle}</div>}
    </div>
  );
}

/* --- 自定义 Tooltip --- */

function SongTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-bg-dark/95 border border-primary/20 rounded-lg px-3 py-2 shadow-xl">
      <p className="text-xs text-primary font-medium mb-1">{label} 年</p>
      <p className="text-xs text-text">歌曲：<span className="text-primary font-bold">{payload[0].value}</span> 首</p>
    </div>
  );
}

function AlbumTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-bg-dark/95 border border-accent-teal/20 rounded-lg px-3 py-2 shadow-xl">
      <p className="text-xs text-accent-teal font-medium mb-1">{label} 年</p>
      <p className="text-xs text-text">專輯：<span className="text-accent-teal font-bold">{payload[0].value}</span> 張</p>
    </div>
  );
}

function CombinedTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-bg-dark/95 border border-primary/20 rounded-lg px-3 py-2 shadow-xl">
      <p className="text-xs text-text-secondary font-medium mb-1">{label} 年</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} className="text-xs text-text">
          {p.name}：<span style={{ color: p.stroke }} className="font-bold">{p.value}</span>
          {p.dataKey === 'songs' ? ' 首' : ' 張'}
        </p>
      ))}
    </div>
  );
}

function MagTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-bg-dark/95 border border-purple-400/20 rounded-lg px-3 py-2 shadow-xl">
      <p className="text-xs text-purple-400 font-medium mb-1">{label} 年</p>
      <p className="text-xs text-text">雜誌：<span className="text-purple-400 font-bold">{payload[0].value}</span> 本</p>
    </div>
  );
}
