import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Music, Clock, Building } from 'lucide-react';
import { getAlbumBySlug, getSongsByAlbum, getImageUrl } from '../lib/data';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import Breadcrumb from '../components/Breadcrumb';

export default function AlbumPage() {
  const { slug } = useParams<{ slug: string }>();
  const album = getAlbumBySlug(slug || '');
  const albumSongs = album ? getSongsByAlbum(album.slug) : [];
  useDocumentTitle(album?.title);

  if (!album) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <p className="text-text-muted text-lg">找不到該專輯</p>
        <Link to="/" className="text-primary hover:underline mt-4 inline-block">返回首頁</Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <Breadcrumb items={[
        { label: `${album.year}年`, path: `/year/${album.year}` },
        { label: album.title },
      ]} />
      <Link to={`/year/${album.year}`} className="inline-flex items-center gap-2 text-text-muted hover:text-primary transition-colors mb-8">
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">返回 {album.year}年</span>
      </Link>

      {/* Album Header */}
      <div className="flex flex-col md:flex-row gap-8 mb-12">
        {album.images.length > 0 ? (
          <div className="w-full md:w-72 flex-shrink-0">
            <img
              src={getImageUrl(album.images[0].filename)}
              alt={album.title}
              className="w-full rounded-xl shadow-2xl shadow-primary/10"
            />
          </div>
        ) : (
          <div className="w-full md:w-72 flex-shrink-0 aspect-square bg-gradient-to-br from-bg-dark to-bg-secondary rounded-xl flex items-center justify-center">
            <Music className="w-24 h-24 text-primary/20" />
          </div>
        )}

        <div className="flex-1">
          <h1 className="text-3xl lg:text-4xl font-bold font-serif text-text mb-3">
            {album.title}
          </h1>
          <p className="text-primary font-medium mb-6">{album.year}年</p>

          {/* Album Info */}
          <div className="space-y-2 text-sm">
            {album.catalogNumber && (
              <div className="flex items-center gap-2 text-text-secondary">
                <span className="text-text-muted w-16">編號</span>
                <span>{album.catalogNumber}</span>
              </div>
            )}
            {album.publisher && (
              <div className="flex items-center gap-2 text-text-secondary">
                <Building className="w-3.5 h-3.5 text-text-muted" />
                <span>{album.publisher}</span>
              </div>
            )}
            {album.distributor && (
              <div className="flex items-center gap-2 text-text-secondary">
                <span className="text-text-muted w-16">發行</span>
                <span>{album.distributor}</span>
              </div>
            )}
          </div>

          {/* Crew */}
          {Object.keys(album.crew).length > 0 && (
            <div className="mt-6 pt-4 border-t border-primary/10">
              <h3 className="text-xs text-text-muted uppercase tracking-wider mb-3">製作團隊</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                {Object.entries(album.crew).filter(([, name]) => name != null).slice(0, 10).map(([role, name]) => (
                  <div key={role} className="flex gap-2">
                    <span className="text-text-muted flex-shrink-0">{role}：</span>
                    <span className="text-text-secondary">{name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Album Description */}
      {album.description && (
        <div className="mb-12 bg-bg-secondary/30 border border-primary/10 rounded-xl p-6">
          <p className="text-text-secondary leading-relaxed whitespace-pre-wrap font-serif italic">
            {album.description}
          </p>
        </div>
      )}

      {/* Track List */}
      {(albumSongs.length > 0 || album.trackList.length > 0) && (
        <section>
          <h2 className="text-xl font-semibold text-text mb-6 flex items-center gap-2">
            <Music className="w-5 h-5 text-primary" />
            曲目列表
          </h2>
          <div className="space-y-2">
            {albumSongs.length > 0 ? (
              // Display songs that belong to this album
              albumSongs.map((song, idx) => (
                <Link
                  key={song.slug}
                  to={`/song/${song.slug}`}
                  state={{ from: { label: album.title, path: `/album/${album.slug}` } }}
                  className="flex items-center gap-4 p-4 rounded-lg bg-bg-secondary/30 border border-primary/5 hover:border-primary/20 hover:bg-bg-secondary/60 transition-all group"
                >
                  <span className="w-8 text-center text-sm text-text-muted font-mono">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-text group-hover:text-primary transition-colors truncate">
                      {song.title}
                    </p>
                    <p className="text-xs text-text-muted mt-0.5 truncate">
                      {[
                        song.composer.length > 0 && `曲：${song.composer.join('/')}`,
                        song.lyricist.length > 0 && `詞：${song.lyricist.join('/')}`,
                      ].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                  {song.duration && (
                    <div className="flex items-center gap-1 text-text-muted">
                      <Clock className="w-3 h-3" />
                      <span className="text-xs">{song.duration}</span>
                    </div>
                  )}
                </Link>
              ))
            ) : (
              // Display trackList from itemize (compilations etc.)
              (() => {
                // Build flat list with side/disc headers injected when side changes
                const elements: JSX.Element[] = [];
                let prevSide: string | undefined = undefined;
                album.trackList.forEach((track, idx) => {
                  // Show side/disc header when side value changes
                  if (track.side && track.side !== prevSide) {
                    prevSide = track.side;
                    elements.push(
                      <div key={`side-${idx}`} className="py-2 px-4 mt-3 first:mt-0">
                        <span className="text-xs font-medium text-primary uppercase tracking-wider">{track.side}</span>
                      </div>
                    );
                  }
                  // Regular track (clickable if has songSlug)
                  const trackContent = (
                    <div className={`flex items-center gap-4 p-4 rounded-lg bg-bg-secondary/30 border border-primary/5 ${track.songSlug ? 'hover:border-primary/20 hover:bg-bg-secondary/60 transition-all group' : ''}`}>
                      <span className="w-8 text-center text-sm text-text-muted font-mono">
                        {String(track.number).padStart(2, '0')}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium text-text truncate ${track.songSlug ? 'group-hover:text-primary transition-colors' : ''}`}>
                          {track.title}
                        </p>
                      </div>
                    </div>
                  );
                  elements.push(
                    track.songSlug ? (
                      <Link key={idx} to={`/song/${track.songSlug}`} state={{ from: { label: album.title, path: `/album/${album.slug}` } }}>
                        {trackContent}
                      </Link>
                    ) : (
                      <div key={idx}>{trackContent}</div>
                    )
                  );
                });
                return elements;
              })()
            )}
          </div>
        </section>
      )}

      {/* Versions */}
      {album.versions.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-semibold text-text mb-6">版本介紹</h2>
          <div className="space-y-3">
            {album.versions.map((v, i) => (
              <div key={i} className="p-4 bg-bg-secondary/30 rounded-lg border border-primary/5">
                <p className="text-sm text-text-secondary">{v}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
