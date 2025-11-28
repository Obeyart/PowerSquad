import React, { useState, useEffect } from 'react';
import { X, Save, Clock } from 'lucide-react';
import { Friend } from '../types';

interface EditScheduleModalProps {
  friend: Friend;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, newSchedule: number[]) => void;
}

const EditScheduleModal: React.FC<EditScheduleModalProps> = ({ friend, isOpen, onClose, onSave }) => {
  const [schedule, setSchedule] = useState<number[]>([]);

  useEffect(() => {
    if (friend) {
      setSchedule([...friend.schedule]);
    }
  }, [friend, isOpen]);

  if (!isOpen) return null;

  const toggleHour = (index: number) => {
    const newSchedule = [...schedule];
    newSchedule[index] = newSchedule[index] === 1 ? 0 : 1;
    setSchedule(newSchedule);
  };

  const setAll = (val: number) => {
    setSchedule(Array(24).fill(val));
  };

  const handleSave = () => {
    onSave(friend.id, schedule);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in-up">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl p-6 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
            <Clock className="text-cyan-400" />
            Редагування графіку
        </h2>
        <p className="text-sm text-slate-400 mb-6">
            Налаштуйте години, коли у вас (<span className="text-cyan-400 font-bold">{friend.name}</span>) є світло.
        </p>

        <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800 mb-6">
             <div className="flex justify-between items-center mb-4">
                <label className="text-xs font-bold uppercase text-slate-500">24-годинний формат</label>
                <div className="flex gap-2">
                    <button onClick={() => setAll(1)} className="text-xs px-2 py-1 bg-cyan-900/30 text-cyan-400 rounded hover:bg-cyan-900/50">Всі ON</button>
                    <button onClick={() => setAll(0)} className="text-xs px-2 py-1 bg-red-900/30 text-red-400 rounded hover:bg-red-900/50">Всі OFF</button>
                </div>
            </div>
            
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
            {schedule.map((status, index) => (
                <button
                key={index}
                onClick={() => toggleHour(index)}
                className={`
                    aspect-square rounded-lg flex flex-col items-center justify-center text-sm font-bold transition-all border
                    ${status === 1 
                    ? 'bg-cyan-600/20 border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/30 hover:scale-105' 
                    : 'bg-slate-900 border-slate-700 text-slate-600 hover:border-red-500/30 hover:bg-red-900/10 pattern-diagonal-lines'}
                `}
                >
                <span>{index}:00</span>
                <span className="text-[10px] opacity-70 font-normal">{status === 1 ? 'ON' : 'OFF'}</span>
                </button>
            ))}
            </div>
        </div>

        <div className="flex justify-end gap-3">
            <button 
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-slate-400 hover:bg-slate-800 transition-colors"
            >
                Скасувати
            </button>
            <button 
                onClick={handleSave}
                className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-cyan-900/20"
            >
                <Save size={18} /> Зберегти зміни
            </button>
        </div>
      </div>
    </div>
  );
};

export default EditScheduleModal;