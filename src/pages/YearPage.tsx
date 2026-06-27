import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Disc3, Music } from 'lucide-react';
import { getAlbumsByYear, songs, getImageUrl } from '../lib/data';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import Breadcrumb from '../components/Breadcrumb';
import LazyImage from '../components/LazyImage';

export default function YearPage() {
  const { year } = useParams<{ year: string }>();
  const yearNum = parseInt(year || '0');
  useDocumentTitle(`${yearNum}年`);
  const yearAlbums = getAlbumsByYear(yearNum);
  const yearSongs = songs.filter(s => s.year === yearNum);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <Breadcrumb items={[{ label: `${yearNum}年` }]} />
      <Link to="/" className="inline-flex items-center gap-2 text-text-muted hover:text-primary transition-colors mb-8">
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">返回時間線</span>
      </Link>

      <div className="mb-12">
        <h1 className="text-4xl font-bold font-serif text-primary mb-2">
          {yearNum}年
        </h1>
        <p className="text-text-secondary">
          共 {yearSongs.length} 首歌曲，{yearAlbums.filter(a => !(a as any).isSingleCollection).length} 張專輯
        </p>
      </div>

      {/* Albums */}
      {yearAlbums.filter(a => !(a as any).isSingleCollection).length > 0 && (
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-text mb-6 flex items-center gap-2">
            <Disc3 className="w-5 h-5 text-primary" />
            專輯
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {yearAlbums
              .filter(a => !(a as any).isSingleCollection)
              .map(album => (
                <Link
                  key={album.slug}
                  to={`/album/${album.slug}`}
                  className="group bg-bg-secondary/50 border border-primary/10 rounded-xl overflow-hidden hover:border-primary/30 transition-all hover:shadow-lg hover:shadow-primary/5"
                >
                  {album.images.length > 0 ? (
                    <LazyImage
                      src={getImageUrl(album.images[0].filename)}
                      alt={album.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      aspectRatio="aspect-square"
                    />
                  ) : (
                    <div className="aspect-square bg-gradient-to-br from-bg-dark to-bg-secondary flex items-center justify-center">
                      <Disc3 className="w-16 h-16 text-primary/20" />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-text group-hover:text-primary transition-colors truncate">
                      {album.title}
                    </h3>
                    <p className="text-sm text-text-muted mt-1">
                      {album.songs.length} 首歌曲
                    </p>
                  </div>
                </Link>
              ))}
          </div>
        </section>
      )}

      {/* All Songs of this year */}
      <section>
        <h2 className="text-xl font-semibold text-text mb-6 flex items-center gap-2">
          <Music className="w-5 h-5 text-primary" />
          全部歌曲
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {yearSongs.map(song => (
            <Link
              key={song.slug}
              to={`/song/${song.slug}`}
              state={{ from: { label: `${year}年`, path: `/year/${year}` } }}
              className="flex items-center gap-3 p-3 rounded-lg bg-bg-secondary/30 border border-primary/5 hover:border-primary/20 hover:bg-bg-secondary/60 transition-all group"
            >
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Music className="w-3.5 h-3.5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-text group-hover:text-primary transition-colors truncate">
                  {song.title}
                </p>
                <p className="text-xs text-text-muted truncate">
                  {song.composer.length > 0 && `曲：${song.composer.join('/')}`}
                  {song.lyricist.length > 0 && ` · 詞：${song.lyricist.join('/')}`}
                </p>
              </div>
              {song.duration && (
                <span className="text-xs text-text-muted flex-shrink-0">{song.duration}</span>
              )}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
