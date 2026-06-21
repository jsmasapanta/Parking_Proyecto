import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ticket, IdCard, Car, MapPin, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import Card from './Card';
import { listarZonas } from '../api/zonas';
import { emitirTicketEntrada } from '../api/tickets';

export default function EmitirTicket({ onTicketCreado, delay }) {
  const [zonas, setZonas] = useState([]);
  const [cedula, setCedula] = useState('');
  const [placa, setPlaca] = useState('');
  const [zonaId, setZonaId] = useState('');
  const [error, setError] = useState(null);
  const [exito, setExito] = useState(null);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    listarZonas()
      .then((data) => {
        setZonas(data);
        if (data.length > 0) setZonaId(data[0].id);
      })
      .catch((err) => setError(err.message));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!cedula.trim() || !placa.trim() || !zonaId) return;
    setCargando(true);
    setError(null);
    setExito(null);
    try {
      const ticket = await emitirTicketEntrada({ cedula, placa, zonaId });
      setExito(ticket.id);
      setCedula('');
      setPlaca('');
      onTicketCreado?.(ticket);
      setTimeout(() => setExito(null), 5000);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  const inputClass =
    'w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all';

  return (
    <Card icon={Ticket} title="Emitir ticket de entrada" accent="blue" delay={delay}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={cedula}
            onChange={(e) => setCedula(e.target.value)}
            placeholder="Cédula"
            className={inputClass}
          />
        </div>

        <div className="relative">
          <Car className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={placa}
            onChange={(e) => setPlaca(e.target.value.toUpperCase())}
            placeholder="Placa"
            className={`${inputClass} font-mono`}
          />
        </div>

        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
          <select
            value={zonaId}
            onChange={(e) => setZonaId(e.target.value)}
            className={`${inputClass} appearance-none cursor-pointer`}
          >
            {zonas.map((z) => (
              <option key={z.id} value={z.id}>
                {z.nombre}
              </option>
            ))}
          </select>
        </div>

        <motion.button
          type="submit"
          disabled={cargando}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="group w-full bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 shimmer text-white text-sm font-semibold px-4 py-3 rounded-xl shadow-lg shadow-blue-500/30 disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {cargando ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
              className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
            />
          ) : (
            <>
              Emitir ticket
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </motion.button>
      </form>

      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-2 text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-4 py-3 mt-3"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </motion.div>
        )}

        {exito && (
          <motion.div
            key="exito"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 mt-3"
          >
            <motion.div
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
            </motion.div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-emerald-700">Ticket emitido</p>
              <p className="text-[11px] text-emerald-600 font-mono truncate">{exito}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}