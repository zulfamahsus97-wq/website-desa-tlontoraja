import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        index: resolve(process.cwd(), "index.html"),
        layanan: resolve(process.cwd(), "layanan.html"),
        formulir: resolve(process.cwd(), "formulir.html"),
        pecahKK: resolve(process.cwd(), "pecah-kk.html"),
        lacakPengajuan: resolve(
          process.cwd(),
          "lacak-pengajuan.html"
        ),
        admin: resolve(process.cwd(), "admin.html"),
        dashboard: resolve(process.cwd(), "dashboard.html"),
        resetPassword: resolve(
          process.cwd(),
          "reset-password.html"
        ),
      },
    },
  },
});