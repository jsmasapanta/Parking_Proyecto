import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Car, Palette, AlertCircle, CheckCircle2, Ban } from 'lucide-react';
import Card from './Card';
import { consultarDisponibilidadVehiculo } from '../api/vehiculos';

export default function BuscarVehiculo({ delay }) {
  const [placa, setPlaca] = useState('');
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);

  async function handleBuscar(e) {
    e.preventDefault();
    if (!placa.trim()) return;
    setCargando(true);
    setError(null);
    setResultado(null);
    try {
      const data = await consultarDisponibilidadVehiculo(placa);
      setResultado(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <Card icon={Car} title="Buscar vehículo" accent="blue" delay={delay}>
      <form onSubmit={handleBuscar} className="flex gap-2 mb-4">
        <input
          type="text"
          value={placa}
          onChange={(e) => setPlaca(e.target.value.toUpperCase())}
          placeholder="Placa (ej. PBA-3256)"
          className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
        />
        <motion.button
          type="submit"
          disabled={cargando}
          whileTap={{ scale: 0.95 }}
          className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white px-4 py-2.5 rounded-xl shadow-md disabled:opacity-50 flex items-center justify-center min-w-[44px]"
        >
          {cargando ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
              className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
            />
          ) : (
            <Search className="w-4 h-4" strokeWidth={2.5} />
          )}
        </motion.button>
      </form>

      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            key="error"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-4 py-3"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </motion.div>
        )}

        {resultado && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="bg-white/60 border border-slate-100 rounded-xl p-4"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-bold text-slate-800">
                  {resultado.vehiculo.marca} {resultado.vehiculo.modelo}
                </p>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  {resultado.vehiculo.placa} · {resultado.vehiculo.anio}
                </p>
              </div>
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.15 }}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                  resultado.disponible
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-amber-100 text-amber-700'
                }`}
              >
                {resultado.disponible ? (
                  <><CheckCircle2 className="w-3.5 h-3.5" /> Disponible</>
                ) : (
                  <><Ban className="w-3.5 h-3.5" /> En parqueadero</>
                )}
              </motion.span>
            </div>
            <p className="flex items-center gap-2 text-xs text-slate-500">
              <Palette className="w-3.5 h-3.5" /> {resultado.vehiculo.color}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}