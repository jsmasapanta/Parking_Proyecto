import { useState } from 'react';
import { motion } from 'framer-motion';
import { CircleParking, Server } from 'lucide-react';
import BuscarPersona from './components/BuscarPersona';
import BuscarVehiculo from './components/BuscarVehiculo';
import ListaZonas from './components/ListaZonas';
import EmitirTicket from './components/EmitirTicket';
import TicketsActivos from './components/TicketsActivos';

function App() {
  const [refrescoTickets, setRefrescoTickets] = useState(0);

  function handleTicketCreado() {
    setRefrescoTickets((n) => n + 1);
  }

  return (
    <div className="min-h-screen bg-mesh">
      <div className="max-w-6xl mx-auto px-5 py-8">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ rotate: -10, scale: 0.8 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
              className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30"
            >
              <CircleParking className="w-7 h-7 text-white" strokeWidth={2.2} />
            </motion.div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Parqueadero
              </h1>
              <p className="text-xs text-slate-400 font-medium">
                Sistema distribuido de gestión vehicular
              </p>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="hidden sm:flex items-center gap-2 glass rounded-full px-4 py-2 shadow-sm"
          >
            <Server className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-xs font-semibold text-slate-600">4 microservicios</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 pulse-live" />
          </motion.div>
        </motion.header>

        {/* Grid principal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="space-y-5">
            <EmitirTicket onTicketCreado={handleTicketCreado} delay={0.1} />
            <BuscarPersona delay={0.2} />
            <BuscarVehiculo delay={0.3} />
          </div>

          <div className="space-y-5">
            <TicketsActivos refrescarSenal={refrescoTickets} delay={0.15} />
            <ListaZonas delay={0.25} />
          </div>
        </div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-10 text-xs text-slate-400"
        >
          Conectado vía Kong API Gateway · localhost:8000
        </motion.footer>
      </div>
    </div>
  );
}

export default App;