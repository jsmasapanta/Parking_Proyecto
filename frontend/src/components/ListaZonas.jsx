import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutGrid, RefreshCw, MapPin } from 'lucide-react';
import Card from './Card';
import { listarZonas } from '../api/zonas';

export default function ListaZonas({ delay }) {
  const [zonas, setZonas] = useState([]);
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarZonas();
  }, []);

  async function cargarZonas() {
    setCargando(true);
    setError(null);
    try {
      const data = await listarZonas();
      setZonas(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  const tipoColor = {
    VIP: 'bg-violet-100 text-violet-600',
    REGULAR: 'bg-blue-100 text-blue-600',
    EXTERNA: 'bg-slate-100 text-slate-600',
    INTERNA: 'bg-cyan-100 text-cyan-600',
    PREFERENCIAL: 'bg-amber-100 text-amber-600',
  };

  return (
    <Card
      icon={LayoutGrid}
      title="Zonas"
      accent="green"
      delay={delay}
      action={
        <motion.button
          onClick={cargarZonas}
          whileHover={{ rotate: 180 }}
          transition={{ duration: 0.4 }}
          className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
        >
          <RefreshCw className="w-4 h-4" />
        </motion.button>
      }
    >
      {cargando && (
        <div className="flex items-center justify-center py-8 text-slate-400 text-sm gap-2">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            className="w-4 h-4 border-2 border-slate-300 border-t-transparent rounded-full"
          />
          Cargando zonas...
        </div>
      )}

      {error && (
        <p className="text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      {!cargando && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-1">
          <AnimatePresence>
            {zonas.map((zona, i) => {
              const total = zona.espacios?.length ?? 0;
              const libres = zona.espacios?.filter((e) => e.estadoEspacio === 'LIBRE').length ?? 0;
              const pct = total > 0 ? (libres / total) * 100 : 0;

              return (
                <motion.div
                  key={zona.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: i * 0.04 }}
                  whileHover={{ y: -3, transition: { duration: 0.2 } }}
                  className="bg-white/70 border border-slate-100 rounded-xl p-3.5"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <p className="font-bold text-slate-800 text-sm">{zona.nombre}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${tipoColor[zona.tipo] || 'bg-slate-100 text-slate-600'}`}>
                      {zona.tipo}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono mb-2">{zona.codigo}</p>

                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-slate-500">
                      <span className="font-bold text-slate-700">{libres}</span> / {total} libres
                    </span>
                    <span className="font-semibold text-slate-400">{Math.round(pct)}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, delay: i * 0.04, ease: 'easeOut' }}
                      className={`h-full rounded-full ${
                        pct > 50 ? 'bg-emerald-400' : pct > 20 ? 'bg-amber-400' : 'bg-rose-400'
                      }`}
                    />
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </Card>
  );
}