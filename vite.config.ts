import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import basicSsl from '@vitejs/plugin-basic-ssl';

// HTTPS con certificado autofirmado: necesario para que el navegador
// del celular entregue geolocalización cuando accede por IP de red local.
export default defineConfig({
  plugins: [react(), tailwindcss(), basicSsl()],
});
