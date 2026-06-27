# 菲樂集 — 王菲演唱歌曲編年 Web App

> 一個以時間線為核心的王菲歌曲資料庫，收錄 1982–2025 年間的演唱作品、專輯、雜誌封面及相關統計。

## 預覽

- **首頁**：Hero 區域 + 編年時間線（橫向滾動）
- **索引**：按歌曲、專輯、作曲人、作詞人等維度瀏覽
- **雜誌封面館**：按年份展示雜誌封面，支持 Lightbox 大圖瀏覽
- **統計**：以 Recharts 圖表展示歷年歌曲/專輯數量趨勢
- **搜索**：即時搜索歌曲名、專輯名、作曲人、歌詞片段（簡繁自動匹配）
- **歌曲詳情**：歌詞、創作人員、專輯歸屬、相關圖片
- **專輯詳情**：曲目列表、封面圖
- **關於**：項目說明

## 技術棧

| 類別 | 技術 |
|------|------|
| 框架 | React 18 + TypeScript |
| 構建 | Vite 5 |
| 路由 | React Router v6（懶加載） |
| 樣式 | Tailwind CSS 3 + CSS Variables（支持深色/淺色主題切換） |
| 圖表 | Recharts |
| 搜索 | Fuse.js + pinyin-pro（拼音匹配） |
| 圖標 | Lucide React + React Icons |
| 圖片 | WebP 格式，Sharp 批量轉換，LazyImage 懶加載 |
| 國際化 | 自建 LangContext（中文/English） |

## 項目結構

```
fayewong-web/
├── data/                    # JSON 數據源
│   ├── songs.json           # 歌曲資料（~1000首）
│   ├── albums.json          # 專輯資料
│   ├── timeline.json        # 時間線數據
│   ├── magazines.json       # 雜誌封面數據
│   ├── index.json           # 索引（作曲/作詞/編曲等）
│   ├── search-index.json    # 搜索索引
│   └── image-map.json       # 圖片路徑映射
├── public/images/           # WebP 圖片資源
├── src/
│   ├── components/          # 通用組件
│   │   ├── Navigation.tsx   # 導航欄（含即時搜索、主題/語言切換）
│   │   ├── Layout.tsx       # 頁面佈局
│   │   ├── LazyImage.tsx    # 圖片懶加載
│   │   ├── Breadcrumb.tsx   # 麵包屑導航
│   │   └── ...
│   ├── contexts/            # React Context
│   │   ├── ThemeContext.tsx  # 深色/淺色主題
│   │   └── LangContext.tsx  # 中/英語言切換
│   ├── lib/                 # 工具庫
│   │   ├── data.ts          # 數據加載與查詢函數
│   │   └── search.ts        # 搜索引擎（Fuse.js + 拼音）
│   ├── pages/               # 頁面組件
│   │   ├── HomePage.tsx     # 首頁（Hero + 時間線）
│   │   ├── YearPage.tsx     # 年份詳情
│   │   ├── AlbumPage.tsx    # 專輯詳情
│   │   ├── SongPage.tsx     # 歌曲詳情
│   │   ├── IndexPage.tsx    # 索引頁
│   │   ├── SearchPage.tsx   # 搜索結果頁
│   │   ├── MagazinePage.tsx # 雜誌封面館
│   │   ├── StatsPage.tsx    # 統計圖表
│   │   └── AboutPage.tsx    # 關於頁
│   ├── App.tsx              # 根組件（路由 + Provider）
│   └── index.css            # 全局樣式 + CSS 變量
├── scripts/                 # 構建腳本
│   ├── convert-to-webp.mjs  # 圖片轉 WebP
│   ├── update-image-map.mjs # 更新圖片映射
│   └── generate-sitemap.mjs # 生成 sitemap
├── tailwind.config.ts       # Tailwind 配置（RGB 通道變量 + opacity）
└── package.json
```

## 功能特性

- **深色/淺色主題**：點擊導航欄太陽/月亮圖標切換，偏好保存至 localStorage
- **中英文切換**：點擊地球圖標切換界面語言
- **即時搜索**：導航欄內嵌搜索框，輸入即顯示下拉結果（最多 8 條），Enter 進入完整搜索頁
- **時間線橫向滾動**：滾輪自動轉為橫向滑動，點擊年份跳轉詳情
- **雜誌 Lightbox**：點擊封面查看大圖，支持鍵盤左右切換、觸摸滑動、Escape 關閉
- **響應式設計**：桌面端與移動端自適應佈局
- **路由懶加載**：按需加載頁面，首屏加載快速
- **SEO 友好**：MetaTags 組件動態設置頁面標題

## 開發

```bash
# 安裝依賴
npm install

# 啟動開發服務器
npm run dev

# 構建生產版本
npm run build

# 圖片優化（JPG/PNG → WebP + 更新映射）
npm run images:optimize

# 生成 sitemap
npm run sitemap
```

## 數據來源

數據整理自《菲樂集——王菲演唱歌曲編年》（赤霓編，2025），涵蓋王菲自 1982 年至 2025 年的演唱歌曲、專輯、合作人員及雜誌封面資料。

## 授權

本項目為個人研究性質的非商業項目。歌曲資料、歌詞、圖片等版權歸原權利人所有。
