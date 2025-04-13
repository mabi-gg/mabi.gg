import { UserConfig } from 'vite'
import vike from 'vike/plugin'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react-swc'

export default {
  plugins: [vike(), react(), tailwindcss()],
  build: {
    rollupOptions: {
      external: ['wrangler'],
    },
    target: "es2022",
  },
  server: {
    port: 5173,
  },
} satisfies UserConfig
