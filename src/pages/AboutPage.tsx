import { BookOpen, Heart, Info } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold font-serif text-text mb-12 text-center">關於本站</h1>

      <div className="space-y-10">
        {/* Introduction */}
        <section className="bg-bg-secondary/30 border border-primary/10 rounded-xl p-8">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold text-text font-serif">前言</h2>
          </div>
          <div className="text-text-secondary leading-relaxed space-y-4">
            <p>
              《菲樂集——王菲演唱歌曲編年》是一部以編年體形式記錄王菲所有演唱歌曲的資料集。
              本書收錄了王菲自1982年首次公開演唱至2025年的全部歌曲作品，
              包括正式發行的專輯歌曲、單曲、合唱歌曲、演唱會曲目、廣告歌曲等。
            </p>
            <p>
              每首歌曲條目包含：歌名、作曲、作詞、編曲、監製、歌曲時長、歌詞全文、
              歌曲背景介紹、相關圖片、獲獎記錄等信息。
            </p>
            <p>
              本站是該書的在線版本，旨在為歌迷和音樂研究者提供便捷的檢索和瀏覽體驗。
            </p>
          </div>
        </section>

        {/* Conventions */}
        <section className="bg-bg-secondary/30 border border-primary/10 rounded-xl p-8">
          <div className="flex items-center gap-3 mb-4">
            <Info className="w-5 h-5 text-accent-teal" />
            <h2 className="text-xl font-semibold text-text font-serif">凡例</h2>
          </div>
          <div className="text-text-secondary leading-relaxed space-y-3 text-sm">
            <p>一、本書以時間為序，按年份編排王菲演唱的歌曲。</p>
            <p>二、每首歌曲條目力求完整記錄曲、詞、編曲、監製等創作信息。</p>
            <p>三、歌詞以原始發行版本為準，部分歌詞根據音頻確認。</p>
            <p>四、圖片資料來源於公開出版物和網絡資源。</p>
            <p>五、本書使用繁體中文撰寫。</p>
          </div>
        </section>

        {/* Credits */}
        <section className="bg-bg-secondary/30 border border-primary/10 rounded-xl p-8">
          <div className="flex items-center gap-3 mb-4">
            <Heart className="w-5 h-5 text-accent-red" />
            <h2 className="text-xl font-semibold text-text font-serif">致謝</h2>
          </div>
          <div className="text-text-secondary leading-relaxed">
            <p>
              感謝所有為本書提供資料、校對和建議的朋友們。
              感謝王菲的音樂陪伴了我們的歲月。
            </p>
          </div>
        </section>

        {/* Version Info */}
        <section className="text-center pt-8 border-t border-primary/10">
          <p className="text-sm text-text-muted">赤霓編</p>
          <p className="text-xs text-text-muted/60 mt-1">2025年9月7日版</p>
        </section>
      </div>
    </div>
  );
}
