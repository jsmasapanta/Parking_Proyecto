import { motion } from 'framer-motion';

export default function Card({ children, icon: Icon, title, accent = 'blue', action, delay = 0 }) {
  const accentColors = {
    blue: 'from-blue-500 to-cyan-500',
    green: 'from-emerald-500 to-teal-500',
    violet: 'from-violet-500 to-purple-500',
    amber: 'from-amber-500 to-orange-500',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4 }}
      className="glass rounded-2xl shadow-lg shadow-slate-200/50 overflow-hidden"
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${accentColors[accent]} flex items-center justify-center shadow-md`}>
                <Icon className="w-5 h-5 text-white" strokeWidth={2.2} />
              </div>
            )}
            <h2 className="text-base font-bold text-slate-800 tracking-tight">{title}</h2>
          </div>
          {action}
        </div>
        {children}
      </div>
    </motion.div>
  );
}