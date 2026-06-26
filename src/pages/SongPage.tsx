import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, ExternalLink, Music, User, PenTool, Headphones, Disc3 } from 'lucide-react';
import { getSongBySlug, getImageUrl, getAlbumsContainingSong, songs } from '../lib/data';

function renderNoteWithLinks(note: string) {
  const urlRegex = /(https?:\/\/[^\s\u4e00-\u9fff\u3000-\u303f]+)/g;
  const parts = note.split(urlRegex);
  if (parts.length === 1) return note;
  return parts.map((part, i) =>
    part.startsWith('http')
      ? <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-accent-teal hover:underline break-all">{part}</a>
      : <span key={i}>{part}</span>
  );
}

export default function SongPage() {
  const { slug } = useParams<{ slug: string }>();
  const song = getSongBySlug(slug || '');

  if (!song) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <p className="text-text-muted text-lg">找不到該歌曲</p>
        <Link to="/" className="text-primary hover:underline mt-4 inline-block">返回首頁</Link>
      </div>
    );
  }

  // Find prev/next songs in same album
  const albumSongs = songs.filter(s => s.albumSlug === song.albumSlug);
  const currentIdx = albumSongs.findIndex(s => s.slug === song.slug);
  const prevSong = currentIdx > 0 ? albumSongs[currentIdx - 1] : null;
  const nextSong = currentIdx < albumSongs.length - 1 ? albumSongs[currentIdx + 1] : null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* Back link */}
      {song.albumSlug ? (
        <Link to={`/album/${song.albumSlug}`} className="inline-flex items-center gap-2 text-text-muted hover:text-primary transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">返回 {song.albumTitle}</span>
        </Link>
      ) : (
        <Link to={`/year/${song.year}`} className="inline-flex items-center gap-2 text-text-muted hover:text-primary transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">返回 {song.year}年</span>
        </Link>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Title */}
          <h1 className="text-3xl lg:text-4xl font-bold font-serif text-text mb-4">
            {song.title}
          </h1>

          {/* Metadata Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            {song.composer.map(c => (
              <span key={c} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs">
                <Music className="w-3 h-3" /> {c}
              </span>
            ))}
            {song.lyricist.map(l => (
              <span key={l} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-accent-teal/10 text-accent-teal text-xs">
                <PenTool className="w-3 h-3" /> {l}
              </span>
            ))}
            {song.arranger.map(a => (
              <span key={a} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-accent-yellow/10 text-accent-yellow text-xs">
                <Headphones className="w-3 h-3" /> {a}
              </span>
            ))}
            {song.featuring.map(f => (
              <span key={f} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-accent-mint/10 text-accent-mint text-xs">
                <User className="w-3 h-3" /> {f}
              </span>
            ))}
          </div>

          {/* Duration & Year */}
          <div className="flex items-center gap-4 text-sm text-text-muted mb-8">
            {song.duration && (
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> {song.duration}
              </span>
            )}
            <span>{song.year}年</span>
            {song.albumTitle && (
              <Link to={`/album/${song.albumSlug}`} className="text-primary hover:underline">
                {song.albumTitle}
              </Link>
            )}
          </div>

          {/* Description */}
          {song.description && (
            <div className="mb-8 p-5 bg-bg-secondary/30 rounded-xl border border-primary/10">
              <p className="text-text-secondary text-sm leading-relaxed whitespace-pre-wrap">
                {renderNoteWithLinks(song.description)}
              </p>
            </div>
          )}

          {/* Lyrics */}
          {song.lyrics && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-text mb-4 font-serif">歌詞</h2>
              <div className="bg-bg-dark/50 rounded-xl border border-primary/10 p-6 lg:p-8">
                <pre className="text-text-secondary text-sm !leading-[1.5] whitespace-pre-wrap font-serif">
                  {song.lyrics}
                </pre>
              </div>
            </div>
          )}

          {/* External Links */}
          {song.links.length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm font-medium text-text-muted mb-3">外部鏈接</h3>
              <div className="space-y-2">
                {song.links.map((link, i) => (
                  <a
                    key={i}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-accent-teal hover:underline"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    {link.url}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between pt-8 border-t border-primary/10">
            {prevSong ? (
              <Link to={`/song/${prevSong.slug}`} className="text-sm text-text-muted hover:text-primary transition-colors">
                ← {prevSong.title}
              </Link>
            ) : <div />}
            {nextSong ? (
              <Link to={`/song/${nextSong.slug}`} className="text-sm text-text-muted hover:text-primary transition-colors">
                {nextSong.title} →
              </Link>
            ) : <div />}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          {/* Images */}
          {song.images.length > 0 && (
            <div className="space-y-4">
              {song.images.map((img, i) => (
                <div key={i} className="rounded-xl overflow-hidden border border-primary/10">
                  <img
                    src={getImageUrl(img.filename)}
                    alt={img.caption}
                    className="w-full"
                    loading="lazy"
                  />
                  {img.caption && (
                    <p className="text-xs text-text-muted p-3 bg-bg-dark/50">{img.caption}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Notes */}
          {song.notes.length > 0 && (
            <div className="bg-bg-secondary/30 rounded-xl border border-primary/10 p-4">
              <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider mb-3">注釋</h3>
              <div className="space-y-2">
                {song.notes.map((note, i) => (
                  <p key={i} className="text-xs text-text-secondary leading-relaxed">
                    {renderNoteWithLinks(note)}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Production Credits */}
          {song.production.length > 0 && (
            <div className="bg-bg-secondary/30 rounded-xl border border-primary/10 p-4">
              <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider mb-3">製作信息</h3>
              <div className="space-y-1.5">
                {song.production.map((credit, i) => (
                  <div key={i} className="text-xs">
                    <span className="text-text-muted">{credit.role}：</span>
                    <span className="text-text-secondary">{credit.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Albums containing this song */}
          {(() => {
            const containingAlbums = getAlbumsContainingSong(song.slug, song.title);
            return containingAlbums.length > 0 ? (
              <div className="bg-bg-secondary/30 rounded-xl border border-primary/10 p-4">
                <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider mb-3">收錄專輯</h3>
                <div className="space-y-2">
                  {containingAlbums.map((album) => (
                    <Link
                      key={album.slug}
                      to={`/album/${album.slug}`}
                      className="flex items-center gap-2 text-sm text-accent-teal hover:underline"
                    >
                      <Disc3 className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{album.title}</span>
                      <span className="text-xs text-text-muted ml-auto">{album.year}</span>
                    </Link>
                  ))}
                </div>
              </div>
            ) : null;
          })()}

          {/* Cross References */}
          {song.crossRefs.length > 0 && (
            <div className="bg-bg-secondary/30 rounded-xl border border-primary/10 p-4">
              <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider mb-3">相關歌曲</h3>
              <div className="space-y-2">
                {song.crossRefs.map((ref, i) => (
                  <Link
                    key={i}
                    to={`/song/${ref.slug}`}
                    className="block text-sm text-accent-teal hover:underline"
                  >
                    {ref.target}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
