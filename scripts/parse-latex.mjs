/**
 * LaTeX 解析脚本 - 将 fayewong.tex 转为结构化 JSON
 * 输出: data/songs.json, data/albums.json, data/timeline.json, data/index.json
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pinyin } from 'pinyin-pro';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const TEX_DIR = path.resolve(ROOT, '..', 'chapters');
const DATA_DIR = path.resolve(ROOT, 'data');

// Ensure data dir exists
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

// Read main tex file
const texContent = fs.readFileSync(path.join(TEX_DIR, 'fayewong.tex'), 'utf-8').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
const lines = texContent.split('\n');

// ========== Helper Functions ==========

function slugify(text) {
  return text
    .replace(/[^\w\u4e00-\u9fff\u3400-\u4dbf\uF900-\uFAFF]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 80);
}

function stripLatexCommands(text) {
  if (!text) return '';
  let result = text;
  // Remove TeX line comments: % and everything after it on each line (but not \%)
  result = result.replace(/(?<!\\)%.*$/gm, '');
  // Remove \index[...]{...}
  result = result.replace(/\\index\[[^\]]*\]\{[^}]*\}/g, '');
  // Remove \sidenote{...} (handle nested braces simply)
  result = result.replace(/\\sidenote\{[^}]*\}/g, '');
  // Remove \footnote{...}
  result = result.replace(/\\footnote\{[^}]*\}/g, '');
  // Remove \url{...} -> keep URL
  result = result.replace(/\\url\{([^}]*)\}/g, '$1');
  // Remove \textit{...} -> keep text
  result = result.replace(/\\textit\{([^}]*)\}/g, '$1');
  // Remove \refsec{...} -> keep text
  result = result.replace(/\\refsec\{([^}]*)\}/g, '「$1」');
  // Remove \refch{...} -> keep text
  result = result.replace(/\\refch\{([^}]*)\}/g, '「$1」');
  // Remove \reffig{...} -> keep text
  result = result.replace(/\\reffig\{([^}]*)\}/g, '');
  // Remove \labsec, \labch, \labfig
  result = result.replace(/\\lab(sec|ch|fig)\{[^}]*\}/g, '');
  // Remove \fayesong
  result = result.replace(/\\fayesong/g, '');
  // Remove \jiange -> empty line marker
  result = result.replace(/\\jiange/g, '\n');
  // Remove \ding{...} -> symbols
  result = result.replace(/\\ding\{108\}/g, '●');
  result = result.replace(/\\ding\{110\}/g, '▲');
  result = result.replace(/\\ding\{115\}/g, '★');
  result = result.replace(/\\ding\{117\}/g, '◆');
  result = result.replace(/\\ding\{\d+\}/g, '');
  // Remove remaining backslash commands
  result = result.replace(/\\[a-zA-Z]+\*?(\[[^\]]*\])?(\{[^}]*\})?/g, '');
  // Clean up
  result = result.replace(/\{|\}/g, '');
  result = result.replace(/\t/g, '  ');
  // Remove empty parentheses left after stripping commands
  result = result.replace(/（）/g, '');
  result = result.replace(/\(\)/g, '');
  return result.trim();
}

function extractUrls(text) {
  const urls = [];
  const urlRegex = /\\url\{([^}]+)\}/g;
  let match;
  while ((match = urlRegex.exec(text)) !== null) {
    urls.push({ url: match[1], text: match[1] });
  }
  return urls;
}

function extractSidenotes(text) {
  const notes = [];
  const noteRegex = /\\sidenote\{([^}]*)\}/g;
  let match;
  while ((match = noteRegex.exec(text)) !== null) {
    notes.push(stripLatexCommands(match[1]));
  }
  return notes;
}

function extractFootnotes(text) {
  const notes = [];
  const noteRegex = /\\footnote\{([^}]*(?:\{[^}]*\}[^}]*)*)\}/g;
  let match;
  while ((match = noteRegex.exec(text)) !== null) {
    notes.push(stripLatexCommands(match[1]));
  }
  return notes;
}

function extractCrossRefs(text) {
  const refs = [];
  const secRegex = /\\refsec\{([^}]+)\}/g;
  const chRegex = /\\refch\{([^}]+)\}/g;
  let match;
  while ((match = secRegex.exec(text)) !== null) {
    refs.push({ type: 'section', target: match[1], slug: slugify(match[1]) });
  }
  while ((match = chRegex.exec(text)) !== null) {
    refs.push({ type: 'chapter', target: match[1], slug: slugify(match[1]) });
  }
  return refs;
}

function extractIndexEntries(text, type) {
  const entries = [];
  const regex = new RegExp(`\\\\index\\[${type}\\]\\{([^}]+)\\}`, 'g');
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (!entries.includes(match[1])) {
      entries.push(match[1]);
    }
  }
  return entries;
}

function parseMuhou(block) {
  const result = {
    composer: [],
    lyricist: [],
    arranger: [],
    producer: [],
    featuring: [],
    duration: null,
    copyright: null,
    production: [],
  };

  const blockLines = block.split('\n');
  for (const line of blockLines) {
    const trimmed = line.replace(/^[\s　]+/, '');

    // Extract index entries
    const composers = extractIndexEntries(line, 'composer');
    const lyricists = extractIndexEntries(line, 'lyricist');
    const arrangers = extractIndexEntries(line, 'arrangement');
    const feats = extractIndexEntries(line, 'feating');

    result.composer.push(...composers);
    result.lyricist.push(...lyricists);
    result.arranger.push(...arrangers);
    result.featuring.push(...feats);

    // Duration
    const timeMatch = trimmed.match(/時間[：:]\s*(.+)/);
    if (timeMatch) {
      result.duration = timeMatch[1].replace('∶', ':').trim();
    }

    // Producer
    const prodMatch = trimmed.match(/監製[：:]\s*(.+)/);
    if (prodMatch) {
      const name = stripLatexCommands(prodMatch[1]);
      if (name) result.producer.push(name);
    }

    // Copyright
    if (trimmed.match(/^\s*[©OP|SP]/)) {
      const cp = stripLatexCommands(trimmed);
      if (cp) result.copyright = (result.copyright || '') + cp + '; ';
    }

    // English production credits (second muhou block)
    const creditMatch = trimmed.match(/^([A-Z][A-Za-z\s]+(?:by)?)[：:]\s*(.+)/);
    if (creditMatch && !composers.length && !lyricists.length) {
      result.production.push({
        role: creditMatch[1].trim(),
        name: stripLatexCommands(creditMatch[2]),
      });
    }
  }

  // Deduplicate
  result.composer = [...new Set(result.composer)];
  result.lyricist = [...new Set(result.lyricist)];
  result.arranger = [...new Set(result.arranger)];
  result.featuring = [...new Set(result.featuring)];
  result.producer = [...new Set(result.producer)];

  return result;
}

function parseTrackList(buffer) {
  const tracks = [];
  let currentSide = '';
  let currentDisc = '';
  let trackNum = 0;
  const bufLines = buffer.split('\n');
  
  for (const bLine of bufLines) {
    let trimmed = bLine.trim();
    
    // Strip \sidenote{...} and \footnote{...} before matching (they may appear mid-line)
    trimmed = trimmed.replace(/\\sidenote\{[^}]*\}/g, '');
    trimmed = trimmed.replace(/\\footnote\{[^}]*\}/g, '');
    
    // Detect Side markers: \item Side A：, \item Side B：, etc.
    const sideMatch = trimmed.match(/^\\item\s+(Side\s*[A-Z])[：:]/i);
    if (sideMatch) {
      currentSide = sideMatch[1];
      currentDisc = '';
      trackNum = 0;
      continue;
    }
    
    // Detect Disc/CD markers: \item Disc 1：, \item CD 1：, \item DSIC 1, \item disc 01, etc.
    const discMatch = trimmed.match(/^\\item\s+((?:Disc|DSIC|CD|DVD|disc)\s*\d+)\b/i);
    if (discMatch) {
      currentDisc = discMatch[1];
      currentSide = '';
      trackNum = 0;
      continue;
    }
    
    // Detect Part markers: \item Part A：, \item Part B：, etc.
    const partMatch = trimmed.match(/^\\item\s+(Part\s+[A-Z])[：:]/i);
    if (partMatch) {
      currentDisc = partMatch[1];
      currentSide = '';
      trackNum = 0;
      continue;
    }
    
    // Detect combined side markers: \item A、B面：
    const combinedSideMatch = trimmed.match(/^\\item\s+([A-Z][、,][A-Z]面)[：:]/i);
    if (combinedSideMatch) {
      currentDisc = combinedSideMatch[1];
      currentSide = '';
      trackNum = 0;
      continue;
    }
    
    // Detect Chinese face markers: \item 第一面（12∶02）：, \item 第二面：
    const faceMatch = trimmed.match(/^\\item\s+(第[一二三四五六七八九十]+面\s*(?:[（(][^)）]*[)）])?\s*)[：:]/);
    if (faceMatch) {
      currentDisc = faceMatch[1].trim();
      currentSide = '';
      trackNum = 0;
      continue;
    }
    
    // Detect edition/version markers: \item 通版：, \item 日本版加歌（...）：
    const editionMatch = trimmed.match(/^\\item\s+(通版|日本版加歌\s*(?:[（(][^)）]*[)）])?\s*)[：:]/);
    if (editionMatch) {
      currentDisc = editionMatch[1].trim();
      currentSide = '';
      trackNum = 0;
      continue;
    }
    
    // Detect bonus/extra media markers: \item Bonus Remix：, \item Bonus CD：, \item DVD：, etc.
    const bonusMatch = trimmed.match(/^\\item\s+(Bonus\s+(?:Remix|CD|VCD|MV\s+DVD)|(?:KARAOKE\s+)?DVD|[錄录]音室[專专]輯)\s*[：:]/i);
    if (bonusMatch) {
      currentDisc = bonusMatch[1].trim();
      currentSide = '';
      trackNum = 0;
      continue;
    }
    
    // Detect track items inside enumerate
    const trackMatch = trimmed.match(/^\\item\s+(.+)$/);
    if (trackMatch && !trimmed.match(/^\\item\s+(?:Side|Disc|DSIC|CD|DVD|disc|Part|第[一二三四五六七八九十]+面|通版|日本版加歌|Bonus|錄音室專輯)\s/i)) {
      trackNum++;
      let trackTitle = trackMatch[1];
      
      // Extract \refsec{...} reference if present
      const refMatch = trackTitle.match(/\\refsec\{([^}]+)\}/);
      
      // Clean the title: remove \refsec{}, \sidenote{}, LaTeX commands, etc.
      trackTitle = trackTitle
        // Remove TeX comments
        .replace(/(?<!\\)%.*$/g, '')
        // Remove \index[...]{...}
        .replace(/\\index\[[^\]]*\]\{[^}]*\}/g, '')
        // Remove \refsec in various forms
        .replace(/（\\refsec\{[^}]*\}）/g, '')
        .replace(/\(\\refsec\{[^}]*\}\)/g, '')
        .replace(/\\refsec\{[^}]*\}/g, '')
        // Remove \sidenote{}, \footnote{}, \footnotesize
        .replace(/\\sidenote\{[^}]*\}/g, '')
        .replace(/\\footnote\{[^}]*\}/g, '')
        .replace(/\\footnotesize\b/g, '')
        // Remove remaining LaTeX commands and braces
        .replace(/\\[a-zA-Z]+\{[^}]*\}/g, '')
        .replace(/\\[a-zA-Z]+/g, '')
        .replace(/\{|\}/g, '')
        // Remove leading/trailing whitespace and stray backslashes
        .replace(/^\\+\s*/, '')
        // Remove [歌手] or （注释）in brackets
        .replace(/\s*[\[\（].*?[\]\）]\s*/g, '')
        // Collapse whitespace
        .replace(/\s{2,}/g, ' ')
        .trim();
      
      if (trackTitle) {
        tracks.push({
          number: trackNum,
          title: trackTitle,
          side: currentDisc || currentSide || undefined,
          refTarget: refMatch ? refMatch[1] : undefined,
        });
      }
    }
  }
  
  return tracks;
}

// ========== Main Parsing ==========

const albums = [];
const songs = [];
const indexData = {
  music: {},
  composer: {},
  lyricist: {},
  arrangement: {},
  feating: {},
};

let currentYear = 0;
let currentAlbum = null;
let currentSong = null;
let inMuhou = false;
let inGeci = false;
let inKaobox = false;
let inFigure = false;
let inLstlisting = false;
let inItemize = false;
let inEnumerate = false;
let itemizeBuffer = '';
let muhouBuffer = '';
let geciBuffer = '';
let kaoboxBuffer = '';
let figureBuffer = '';
let lstlistingBuffer = '';
let descBuffer = '';
let songRawText = '';
let isFirstMuhou = true;

function finalizeSong() {
  if (!currentSong) return;

  // Process description
  currentSong.description = stripLatexCommands(descBuffer).trim();

  // Extract links, notes, crossrefs from raw text
  currentSong.links = extractUrls(songRawText);
  currentSong.notes = [
    ...extractSidenotes(songRawText),
    ...extractFootnotes(songRawText),
  ];
  currentSong.crossRefs = extractCrossRefs(songRawText);

  // Add to songs array
  songs.push(currentSong);

  // Add to album
  if (currentAlbum) {
    currentAlbum.songs.push(currentSong.slug);
  }

  // Update index
  if (!indexData.music[currentSong.title]) {
    indexData.music[currentSong.title] = [];
  }
  indexData.music[currentSong.title].push({
    title: currentSong.title,
    slug: currentSong.slug,
    year: currentSong.year,
  });

  for (const name of currentSong.composer) {
    if (!indexData.composer[name]) indexData.composer[name] = [];
    indexData.composer[name].push({
      title: currentSong.title,
      slug: currentSong.slug,
      year: currentSong.year,
    });
  }
  for (const name of currentSong.lyricist) {
    if (!indexData.lyricist[name]) indexData.lyricist[name] = [];
    indexData.lyricist[name].push({
      title: currentSong.title,
      slug: currentSong.slug,
      year: currentSong.year,
    });
  }
  for (const name of currentSong.arranger) {
    if (!indexData.arrangement[name]) indexData.arrangement[name] = [];
    indexData.arrangement[name].push({
      title: currentSong.title,
      slug: currentSong.slug,
      year: currentSong.year,
    });
  }
  for (const name of currentSong.featuring) {
    if (!indexData.feating[name]) indexData.feating[name] = [];
    indexData.feating[name].push({
      title: currentSong.title,
      slug: currentSong.slug,
      year: currentSong.year,
    });
  }

  currentSong = null;
  descBuffer = '';
  songRawText = '';
  isFirstMuhou = true;
}

function finalizeAlbum() {
  finalizeSong();
  if (currentAlbum) {
    albums.push(currentAlbum);
    currentAlbum = null;
  }
}

// Parse line by line
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];

  // Part (year)
  const partMatch = line.match(/\\addpartwithbg\{(\d{4})年\}/);
  if (partMatch) {
    currentYear = parseInt(partMatch[1]);
    continue;
  }
  // Special "1980年代"
  if (line.match(/\\addpartwithbg\{1980年代\}/)) {
    currentYear = 1980;
    continue;
  }

  // Chapter (album)
  const chapterMatch = line.match(/^\\chapter\{(.+)\}$/);
  if (chapterMatch) {
    finalizeAlbum();
    const title = chapterMatch[1];
    const isYearSingle = title.match(/^\d{4}年單曲$/);

    currentAlbum = {
      id: `album-${albums.length + 1}`,
      slug: slugify(title),
      title: title,
      year: currentYear,
      catalogNumber: null,
      publisher: null,
      distributor: null,
      releaseDate: null,
      crew: {},
      description: '',
      trackList: [],
      versions: [],
      songs: [],
      images: [],
      isSingleCollection: !!isYearSingle,
    };
    continue;
  }

  // Section (song)
  const sectionMatch = line.match(/^\\section\{(.+)\}$/);
  if (sectionMatch) {
    finalizeSong();
    const title = sectionMatch[1];
    const songId = `song-${songs.length + 1}`;
    currentSong = {
      id: songId,
      slug: slugify(title) + '-' + currentYear,
      title: title,
      aliases: [],
      year: currentYear,
      albumSlug: currentAlbum ? currentAlbum.slug : null,
      albumTitle: currentAlbum ? currentAlbum.title : null,
      composer: [],
      lyricist: [],
      arranger: [],
      producer: [],
      featuring: [],
      duration: null,
      description: '',
      lyrics: '',
      images: [],
      notes: [],
      links: [],
      crossRefs: [],
      copyright: null,
      production: [],
    };
    isFirstMuhou = true;
    continue;
  }

  // Track song raw text for link/note extraction
  if (currentSong) {
    songRawText += line + '\n';
  }

  // Music index (aliases)
  const musicIndexMatch = line.match(/\\index\[music\]\{([^}]+)\}/g);
  if (musicIndexMatch && currentSong) {
    for (const m of musicIndexMatch) {
      const name = m.match(/\\index\[music\]\{([^}]+)\}/)[1];
      if (name !== currentSong.title && !currentSong.aliases.includes(name)) {
        currentSong.aliases.push(name);
      }
    }
  }

  // Begin environments
  if (line.match(/\\begin\{muhou\}/)) {
    inMuhou = true;
    muhouBuffer = '';
    continue;
  }
  if (line.match(/\\begin\{geci\}/)) {
    inGeci = true;
    geciBuffer = '';
    continue;
  }
  if (line.match(/\\begin\{kaobox\}/)) {
    inKaobox = true;
    const titleMatch = line.match(/frametitle=(?:\\noindent\s*)?(.+?)\]/);
    kaoboxBuffer = titleMatch ? `【${titleMatch[1]}】\n` : '';
    continue;
  }
  if (line.match(/\\begin\{marginfigure\}/) || line.match(/\\begin\{figure\*?\}/)) {
    inFigure = true;
    figureBuffer = '';
    continue;
  }
  if (line.match(/\\begin\{lstlisting\}/)) {
    inLstlisting = true;
    lstlistingBuffer = '';
    continue;
  }
  if (line.match(/\\begin\{itemize\}/) && !inItemize) {
    inItemize = true;
    itemizeBuffer = '';
    continue;
  }
  if (line.match(/\\end\{itemize\}/) && inItemize && !line.match(/^\s+\\end\{itemize\}/)) {
    inItemize = false;
    // Parse trackList if we're in album area (before first song)
    if (currentAlbum && !currentSong) {
      const trackList = parseTrackList(itemizeBuffer);
      if (trackList.length > 0) {
        currentAlbum.trackList = trackList;
      }
    }
    continue;
  }

  // End environments
  if (line.match(/\\end\{muhou\}/)) {
    inMuhou = false;
    if (currentSong) {
      const parsed = parseMuhou(muhouBuffer);
      if (isFirstMuhou) {
        currentSong.composer.push(...parsed.composer);
        currentSong.lyricist.push(...parsed.lyricist);
        currentSong.arranger.push(...parsed.arranger);
        currentSong.producer.push(...parsed.producer);
        currentSong.featuring.push(...parsed.featuring);
        currentSong.duration = parsed.duration || currentSong.duration;
        currentSong.copyright = parsed.copyright || currentSong.copyright;
        isFirstMuhou = false;
      }
      currentSong.production.push(...parsed.production);
    }
    continue;
  }
  if (line.match(/\\end\{geci\}/)) {
    inGeci = false;
    if (currentSong) {
      // Process lyrics
      let lyrics = geciBuffer;
      // Remove TeX comments
      lyrics = lyrics.replace(/(?<!\\)%.*$/gm, '');
      lyrics = lyrics.replace(/\\jiange/g, '\n───\n');
      lyrics = lyrics.replace(/\\ding\{108\}/g, '●');
      lyrics = lyrics.replace(/\\ding\{110\}/g, '▲');
      lyrics = lyrics.replace(/\\ding\{115\}/g, '★');
      lyrics = lyrics.replace(/\\ding\{117\}/g, '◆');
      lyrics = lyrics.replace(/\\sidenote\{[^}]*\}/g, '');
      lyrics = lyrics.replace(/\\[a-zA-Z]+\{[^}]*\}/g, '');
      lyrics = lyrics.replace(/\{|\}/g, '');
      lyrics = lyrics.replace(/\\/g, '');
      currentSong.lyrics = lyrics.trim();
    }
    continue;
  }
  if (line.match(/\\end\{kaobox\}/)) {
    inKaobox = false;
    if (currentAlbum && !currentSong) {
      currentAlbum.description += stripLatexCommands(kaoboxBuffer) + '\n';
    } else if (currentSong) {
      descBuffer += kaoboxBuffer + '\n';
    }
    continue;
  }
  if (line.match(/\\end\{marginfigure\}/) || line.match(/\\end\{figure\*?\}/)) {
    inFigure = false;
    // Parse figure content
    const imgMatch = figureBuffer.match(/\\includegraphics(?:\[[^\]]*\])?\{([^}]+)\}/);
    const captionMatch = figureBuffer.match(/\\caption\{([^}]+)\}/);
    const labelMatch = figureBuffer.match(/\\labfig\{([^}]+)\}/);
    if (imgMatch) {
      const img = {
        filename: imgMatch[1],
        caption: captionMatch ? stripLatexCommands(captionMatch[1]) : '',
        label: labelMatch ? labelMatch[1] : '',
      };
      if (currentSong) {
        currentSong.images.push(img);
      } else if (currentAlbum) {
        currentAlbum.images.push(img);
      }
    }
    continue;
  }
  if (line.match(/\\end\{lstlisting\}/)) {
    inLstlisting = false;
    if (currentSong) {
      descBuffer += '\n【獲獎記錄】\n' + lstlistingBuffer.trim() + '\n';
    }
    continue;
  }

  // Buffer content in environments
  if (inMuhou) { muhouBuffer += line + '\n'; continue; }
  if (inGeci) { geciBuffer += line + '\n'; continue; }
  if (inKaobox) { kaoboxBuffer += line + '\n'; continue; }
  if (inFigure) { figureBuffer += line + '\n'; continue; }
  if (inLstlisting) { lstlistingBuffer += line + '\n'; continue; }
  if (inItemize) { itemizeBuffer += line + '\n'; continue; }

  // Album metadata (between chapter and first section)
  if (currentAlbum && !currentSong) {
    const catalogMatch = line.match(/磁帶編號[：:]\s*(.+)/);
    if (catalogMatch) currentAlbum.catalogNumber = catalogMatch[1].trim();

    const pubMatch = line.match(/出\s*版[：:]\s*(.+)/);
    if (pubMatch) currentAlbum.publisher = pubMatch[1].trim();

    const distMatch = line.match(/發\s*行[：:]\s*(.+)/);
    if (distMatch) currentAlbum.distributor = distMatch[1].trim();

    // Crew fields
    const crewMatch = line.match(/^([^\s\\%]+(?:\s*[^\s\\%]+)?)[：:]\s*(.+)$/);
    if (crewMatch && !line.startsWith('%') && !line.startsWith('\\')) {
      const key = crewMatch[1].replace(/\s+/g, '');
      const val = crewMatch[2].trim();
      if (key.length <= 8 && val.length > 0) {
        currentAlbum.crew[key] = val;
      }
    }
  }

  // Description text for songs (not in any environment)
  if (currentSong && !inMuhou && !inGeci && !inKaobox && !inFigure && !inLstlisting) {
    if (!line.match(/^\\/) && !line.match(/^\s*$/) && !line.match(/^%/)) {
      descBuffer += line + '\n';
    } else if (line.match(/^[^\\%]/) && line.trim()) {
      descBuffer += line + '\n';
    }
  }
}

// Finalize last entries
finalizeAlbum();

// ========== Deduplicate slugs ==========
// When same title + same year produces duplicate slugs, append album slug suffix
const slugCount = {};
for (const s of songs) {
  slugCount[s.slug] = (slugCount[s.slug] || 0) + 1;
}
const slugSeen = {};
for (const s of songs) {
  if (slugCount[s.slug] > 1) {
    const oldSlug = s.slug;
    if (!slugSeen[oldSlug]) {
      slugSeen[oldSlug] = 0;
    }
    slugSeen[oldSlug]++;
    if (slugSeen[oldSlug] > 1) {
      // Append album slug to disambiguate
      const albumSuffix = s.albumSlug ? '-' + s.albumSlug.substring(0, 20) : '-' + slugSeen[oldSlug];
      s.slug = oldSlug + albumSuffix;
    }
    // Update album's songs array
    const album = albums.find(a => a.slug === s.albumSlug);
    if (album) {
      const idx = album.songs.indexOf(oldSlug);
      if (idx !== -1) album.songs[idx] = s.slug;
    }
  }
}

// ========== Build Timeline ==========
const timelineMap = {};
for (const album of albums) {
  const year = album.year;
  if (!timelineMap[year]) {
    timelineMap[year] = { year, albums: [], singles: [], songCount: 0 };
  }
  if (album.isSingleCollection) {
    for (const slug of album.songs) {
      const song = songs.find(s => s.slug === slug);
      if (song) {
        timelineMap[year].singles.push({ slug: song.slug, title: song.title });
      }
    }
  } else {
    timelineMap[year].albums.push({
      slug: album.slug,
      title: album.title,
      coverImage: album.images.length > 0 ? album.images[0].filename : null,
    });
  }
  timelineMap[year].songCount += album.songs.length;
}

const timeline = Object.values(timelineMap).sort((a, b) => a.year - b.year);

// ========== Build Index ==========
function getInitial(name) {
  const first = name.charAt(0);
  // English letter
  if (/[a-zA-Z]/.test(first)) {
    return first.toUpperCase();
  }
  // Chinese character - get pinyin initial
  const py = pinyin(first, { pattern: 'first', toneType: 'none' });
  if (py && /[a-zA-Z]/.test(py.charAt(0))) {
    return py.charAt(0).toUpperCase();
  }
  return '#';
}

function buildIndexArray(map) {
  return Object.entries(map)
    .map(([name, songs]) => ({
      name,
      slug: slugify(name),
      initial: getInitial(name),
      songs: songs,
    }))
    .sort((a, b) => a.name.localeCompare(b.name, 'zh'));
}

const siteIndex = {
  music: buildIndexArray(indexData.music),
  composer: buildIndexArray(indexData.composer),
  lyricist: buildIndexArray(indexData.lyricist),
  arrangement: buildIndexArray(indexData.arrangement),
  feating: buildIndexArray(indexData.feating),
};

// ========== Fix CrossRefs slugs ==========
// Build a map from song title to actual slug(s)
const titleToSlugMap = {};
for (const s of songs) {
  if (!titleToSlugMap[s.title]) {
    titleToSlugMap[s.title] = [];
  }
  titleToSlugMap[s.title].push(s.slug);
}

for (const s of songs) {
  s.crossRefs = s.crossRefs.map(ref => {
    let targetName = ref.target;
    let albumHint = null;
    
    // Parse "歌名［专辑名］" or "歌名[专辑名]" format
    const bracketMatch = targetName.match(/^(.+?)[［\[](.+?)[］\]]$/);
    if (bracketMatch) {
      targetName = bracketMatch[1];
      albumHint = bracketMatch[2];
    }
    
    // Try to find actual song slug by target name
    const matches = titleToSlugMap[targetName];
    if (matches && matches.length > 0) {
      let slug = matches[0];
      // If album hint provided and multiple matches, pick the one in that album
      if (albumHint && matches.length > 1) {
        const albumMatch = matches.find(sl => {
          const song = songs.find(x => x.slug === sl);
          return song && song.albumTitle && song.albumTitle.includes(albumHint);
        });
        if (albumMatch) slug = albumMatch;
      }
      return { ...ref, target: targetName, slug };
    }
    // Fallback: try partial match
    const partialKey = Object.keys(titleToSlugMap).find(t => t.includes(targetName) || targetName.includes(t));
    if (partialKey) {
      const pMatches = titleToSlugMap[partialKey];
      let slug = pMatches[0];
      if (albumHint && pMatches.length > 1) {
        const albumMatch = pMatches.find(sl => {
          const song = songs.find(x => x.slug === sl);
          return song && song.albumTitle && song.albumTitle.includes(albumHint);
        });
        if (albumMatch) slug = albumMatch;
      }
      return { ...ref, target: targetName, slug };
    }
    return { ...ref, target: targetName };
  }).filter(ref => {
    // Only keep refs that point to existing songs AND are not self-references
    return ref.slug !== s.slug && songs.some(s2 => s2.slug === ref.slug);
  });
}

// ========== Fuzzy title matching ==========
// Common character variants that appear in album tracklists vs song titles
const CHAR_VARIANTS = [
  ['兒', '儿'],
  ['綫', '线'],
  ['爲', '为'],
  ['雲', '云'],
  ['採', '采'],
  ['曖', '暖'],  // 暧昧 vs 暖昧 (typo in source)
  ['裏', '里'],
  ['峯', '峰'],
  ['麼', '么'],
  ['體', '体'],
  ['國', '国'],
  ['會', '会'],
  ['時', '时'],
  ['愛', '爱'],
  ['門', '门'],
  ['萬', '万'],
  ['對', '对'],
  ['點', '点'],
  ['傳', '传'],
  ['樂', '乐'],
  ['發', '发'],
  ['個', '个'],
  ['來', '来'],
  ['後', '后'],
  ['開', '开'],
  ['關', '关'],
  ['頭', '头'],
  ['風', '风'],
  ['紅', '红'],
  ['長', '长'],
  ['變', '变'],
  ['電', '电'],
  ['動', '动'],
  ['聽', '听'],
  ['氣', '气'],
  ['過', '过'],
  ['飛', '飞'],
  ['夢', '梦'],
  ['寫', '写'],
  ['書', '书'],
  ['説', '说'],
  ['見', '见'],
  ['聲', '声'],
  ['學', '学'],
  ['憶', '忆'],
  ['輕', '轻'],
  ['遠', '远'],
  ['難', '难'],
  ['雙', '双'],
  ['離', '离'],
  ['靜', '静'],
  ['邊', '边'],
  ['選', '选'],
  ['還', '还'],
  ['讓', '让'],
  ['讀', '读'],
  ['説', '说'],
  ['爺', '爷'],
  ['份', '分'],
  ['跡', '迹'],
  ['託', '托'],
  ['復', '复'],
  ['曆', '历'],
  ['遊', '游'],
  ['徵', '征'],
  ['閒', '闲'],
  ['週', '周'],
  ['佔', '占'],
  ['粧', '妆'],
  ['慾', '欲'],
  ['讚', '赞'],
  ['鬆', '松'],
  ['鬥', '斗'],
];

// Normalize title to a comparable form
function normalizeTitle(title) {
  let result = title
    .replace(/[\[\]【】《》（）\(\)「」『』]/g, '')  // Remove brackets
    .replace(/[\s　]+/g, '')                        // Remove all whitespace
    .toLowerCase();
  // Apply character variants
  for (const [trad, simp] of CHAR_VARIANTS) {
    result = result.replace(new RegExp(trad, 'g'), simp);
  }
  return result;
}

function findSongByFuzzyTitle(trackTitle, albumSlug) {
  const normTrack = normalizeTitle(trackTitle);
  const candidates = [];
  
  for (const [songTitle, slugs] of Object.entries(titleToSlugMap)) {
    const normSong = normalizeTitle(songTitle);
    
    // Substring match: one contains the other
    if (normSong.includes(normTrack) || normTrack.includes(normSong)) {
      // Require minimum 2 CJK chars overlap to avoid false matches
      if (normTrack.length >= 2 && normSong.length >= 2) {
        candidates.push(...slugs);
      }
    }
  }
  
  return [...new Set(candidates)];
}

// ========== Resolve trackList songSlug ==========
for (const album of albums) {
  for (const track of album.trackList) {
    // Try to find song by refTarget first
    if (track.refTarget) {
      const matches = titleToSlugMap[track.refTarget];
      if (matches && matches.length > 0) {
        track.songSlug = matches[0];
      } else {
        // Try partial match
        const partialKey = Object.keys(titleToSlugMap).find(t => t.includes(track.refTarget) || track.refTarget.includes(t));
        if (partialKey) {
          track.songSlug = titleToSlugMap[partialKey][0];
        }
      }
    }
    // Also try matching by title (for songs in the same album)
    if (!track.songSlug) {
      const matches = titleToSlugMap[track.title];
      if (matches && matches.length > 0) {
        // Prefer the one in the same album
        const albumSong = matches.find(slug => songs.find(s => s.slug === slug && s.albumSlug === album.slug));
        track.songSlug = albumSong || matches[0];
      }
    }
    // Fuzzy match: try normalized comparison for common character variants
    if (!track.songSlug) {
      const fuzzyMatches = findSongByFuzzyTitle(track.title, album.slug);
      if (fuzzyMatches.length > 0) {
        // Prefer the one in the same album
        const albumSong = fuzzyMatches.find(sl => {
          const song = songs.find(s => s.slug === sl);
          return song && song.albumSlug === album.slug;
        });
        track.songSlug = albumSong || fuzzyMatches[0];
      }
    }
    // Remove refTarget from output (internal use only)
    delete track.refTarget;
  }
}

// ========== Write Output ==========
fs.writeFileSync(path.join(DATA_DIR, 'songs.json'), JSON.stringify(songs, null, 2), 'utf-8');
fs.writeFileSync(path.join(DATA_DIR, 'albums.json'), JSON.stringify(albums, null, 2), 'utf-8');
fs.writeFileSync(path.join(DATA_DIR, 'timeline.json'), JSON.stringify(timeline, null, 2), 'utf-8');
fs.writeFileSync(path.join(DATA_DIR, 'index.json'), JSON.stringify(siteIndex, null, 2), 'utf-8');

// Build search index
const searchItems = [];
for (const song of songs) {
  searchItems.push({
    type: 'song',
    title: song.title,
    slug: song.slug,
    year: song.year,
    album: song.albumTitle,
    excerpt: song.lyrics.substring(0, 100),
  });
}
for (const album of albums) {
  if (!album.isSingleCollection) {
    searchItems.push({
      type: 'album',
      title: album.title,
      slug: album.slug,
      year: album.year,
      excerpt: album.description.substring(0, 100),
    });
  }
}
// Add people
for (const [name, entries] of Object.entries(indexData.composer)) {
  searchItems.push({ type: 'person', title: name + '（作曲）', slug: 'composer-' + slugify(name), excerpt: `${entries.length} 首作品` });
}
for (const [name, entries] of Object.entries(indexData.lyricist)) {
  searchItems.push({ type: 'person', title: name + '（作詞）', slug: 'lyricist-' + slugify(name), excerpt: `${entries.length} 首作品` });
}

fs.writeFileSync(path.join(DATA_DIR, 'search-index.json'), JSON.stringify(searchItems, null, 2), 'utf-8');

console.log(`✅ 解析完成！`);
console.log(`   歌曲: ${songs.length}`);
console.log(`   专辑: ${albums.length}`);
console.log(`   年份: ${timeline.length}`);
console.log(`   作曲人: ${siteIndex.composer.length}`);
console.log(`   作词人: ${siteIndex.lyricist.length}`);
console.log(`   编曲人: ${siteIndex.arrangement.length}`);
console.log(`   合作歌手: ${siteIndex.feating.length}`);
console.log(`   搜索条目: ${searchItems.length}`);
