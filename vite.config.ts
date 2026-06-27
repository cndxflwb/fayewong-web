import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages 部署：
// - 如果部署到 https://<user>.github.io/<repo>/，设置 base 为 '/<repo>/'
// - 如果部署到 https://<user>.github.io/（用户主页），设置 base 为 '/'
export default defineConfig({
  base: '/fayewong-web/',
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    allowedHosts: true,
  },
})
