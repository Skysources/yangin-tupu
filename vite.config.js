import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// GitHub Pages projeyi https://skysources.github.io/yangin-tupu/ altında sunar,
// bu yüzden base alt yol olarak repo adını veriyoruz. Kendi alan adı (custom
// domain) bağlarsan bunu "/" yap.
export default defineConfig({
  base: "/yangin-tupu/",
  plugins: [react()],
});
