import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync, existsSync } from 'fs'
import { join } from 'path'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-widget',
      closeBundle() {
        // Copy widget.js from public to dist after build
        const widgetSrc = join(__dirname, 'public', 'widget.js');
        const widgetDest = join(__dirname, 'dist', 'widget.js');
        if (existsSync(widgetSrc)) {
          copyFileSync(widgetSrc, widgetDest);
          console.log('✓ Copied widget.js to dist');
        }
      }
    }
  ],
  server: {
    port: 3000
  },
  publicDir: 'public'
})
