import { useEffect, useState } from 'react';
import { BrowserRouter, Outlet, Route, Routes } from 'react-router-dom';
import { APIProvider } from '@vis.gl/react-google-maps';
import { LatidoProvider } from './state/LatidoStore';
import { Sidebar } from './components/Sidebar';
import { MobileHeader, MobileNav } from './components/MobileNav';
import { SosBanner } from './components/SosBanner';
import { Dashboard } from './screens/panel/Dashboard';
import { Monitoreo } from './screens/panel/Monitoreo';
import { Historial } from './screens/panel/Historial';
import { Comunicacion } from './screens/panel/Comunicacion';
import { ControlParental } from './screens/panel/ControlParental';
import { Zonas } from './screens/panel/Zonas';
import { Alertas } from './screens/panel/Alertas';
import { Perfil } from './screens/panel/Perfil';
import { Watch } from './screens/watch/Watch';
import { supabaseConfigurado } from './lib/supabase';

const CLAVE_TEMA = 'latido.tema';

function usarTema() {
  const [oscuro, setOscuro] = useState(() => localStorage.getItem(CLAVE_TEMA) === 'oscuro');
  useEffect(() => {
    document.documentElement.classList.toggle('dark', oscuro);
    localStorage.setItem(CLAVE_TEMA, oscuro ? 'oscuro' : 'claro');
  }, [oscuro]);
  return { oscuro, alternar: () => setOscuro((v) => !v) };
}

/** Layout del panel: sidebar + banner SOS global + contenido */
function PanelLayout() {
  const { oscuro, alternar } = usarTema();
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar oscuro={oscuro} onCambiarTema={alternar} />
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileHeader />
        <SosBanner />
        <main className="min-h-0 flex-1 overflow-y-auto pb-16 lg:pb-0">
          <Outlet />
        </main>
        <MobileNav oscuro={oscuro} onCambiarTema={alternar} />
      </div>
    </div>
  );
}

function AvisoConfiguracion() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="max-w-md rounded-3xl border border-amber-300 bg-amber-50 p-8 text-center dark:border-amber-800 dark:bg-amber-950">
        <div className="text-4xl">⚙️</div>
        <h1 className="mt-3 text-xl font-bold">Falta configurar LATIDO</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">
          Copia <code>.env.example</code> a <code>.env</code>, completa las claves de Supabase
          y Google Maps, y reinicia el servidor.
        </p>
      </div>
    </div>
  );
}

export default function App() {
  if (!supabaseConfigurado) return <AvisoConfiguracion />;

  return (
    <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? ''}>
      <LatidoProvider>
        <BrowserRouter>
          <Routes>
            {/* Simulador de reloj: pantalla independiente para el celular */}
            <Route path="/watch" element={<Watch />} />

            {/* Panel de monitoreo */}
            <Route element={<PanelLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="/monitoreo" element={<Monitoreo />} />
              <Route path="/historial" element={<Historial />} />
              <Route path="/comunicacion" element={<Comunicacion />} />
              <Route path="/control" element={<ControlParental />} />
              <Route path="/zonas" element={<Zonas />} />
              <Route path="/alertas" element={<Alertas />} />
              <Route path="/perfil" element={<Perfil />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </LatidoProvider>
    </APIProvider>
  );
}
