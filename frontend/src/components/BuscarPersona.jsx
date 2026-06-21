import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, User, Mail, IdCard, AtSign, AlertCircle } from 'lucide-react';
import Card from './Card';
import {
  buscarPersonaPorCedula,
  buscarPersonaPorUsername,
  buscarPersonasPorApellido,
} from '../api/personas';

const TIPOS = [
  { value: 'cedula', label: 'Cédula' },
  { value: 'username', label: 'Username' },
  { value: 'apellido', label: 'Apellido' },
];

export default function BuscarPersona({ delay }) {
  const [tipo, setTipo] = useState('cedula');
  const [valor, setValor] = useState('');
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);

  async function handleBuscar(e) {
    e.preventDefault();
    if (!valor.trim()) return;
    setCargando(true);
    setError(null);
    setResultado(null);
    try {
      let data;
      if (tipo === 'cedula') data = await buscarPersonaPorCedula(valor);
      else if (tipo === 'username') data = await buscarPersonaPorUsername(valor);
      else data = await buscarPersonasPorApellido(valor);
      setResultado(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  const personas = Array.isArray(resultado) ? resultado : resultado ? [resultado] : [];

  return (
    <Card icon={User} title="Buscar persona" accent="violet" delay={delay}>
      <form onSubmit={handleBuscar} className="flex flex-wrap gap-2 mb-4">
        <div className="flex rounded-xl bg-slate-100 p-1">
          {TIPOS.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setTipo(t.value)}
              className="relative px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors"
            >
              {tipo === t.value && (
                <motion.div
                  layoutId="tipoPersona"
                  className="absolute inset-0 bg-white rounded-lg shadow-sm"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className={`relative ${tipo === t.value ? 'text-violet-600' : 'text-slate-500'}`}>
                {t.label}
              </span>
            </button>
          ))}
        </div>

        <div className="flex-1 flex gap-2 min-w-[200px]">
          <input
            type="text"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            placeholder={`Buscar por ${tipo}...`}
            className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-all"
          />
          <motion.button
            type="submit"
            disabled={cargando}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-br from-violet-500 to-purple-600 text-white px-4 py-2.5 rounded-xl shadow-md disabled:opacity-50 flex items-center justify-center min-w-[44px]"
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
        </div>
      </form>

      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-4 py-3 mb-2"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-2">
        <AnimatePresence>
          {personas.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: i * 0.06 }}
              className="bg-white/60 border border-slate-100 rounded-xl p-4"
            >
              <p className="font-bold text-slate-800 mb-1">
                {p.firstName} {p.middleName} {p.lastName}
              </p>
              <div className="space-y-1 text-xs text-slate-500">
                <p className="flex items-center gap-2">
                  <IdCard className="w-3.5 h-3.5" /> <span className="font-mono">{p.dni}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5" /> {p.email}
                </p>
                {p.usuario && (
                  <p className="flex items-center gap-2">
                    <AtSign className="w-3.5 h-3.5" /> {p.usuario.username}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </Card>
  );
}