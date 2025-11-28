import React, { useState } from 'react';
import { UserPlus, Zap, ZapOff } from 'lucide-react';

interface AddFriendFormProps {
  onAdd: (name: string, schedule: number[]) => void;
}

const AddFriendForm: React.FC<AddFriendFormProps> = ({ onAdd }) => {
  const [name, setName] = useState('');
  const [schedule, setSchedule] = useState<number[]>(Array(24).fill(1));

  const toggleHour = (index: number) => {
    const newSchedule = [...schedule];
    newSchedule[index] = newSchedule[index] === 1 ? 0 : 1;
    setSchedule(newSchedule);
  };

  const setAll = (val: number) => {
    setSchedule(Array(24).fill(val));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onAdd(name, schedule);
      setName('');
      setSchedule(Array(24).fill(1)); 
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex flex-col gap-4 shadow-lg">
      <h3 className="text-sm font-bold text-slate-300">Додати учасника вручну</h3>
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1 ml-1">Нікнейм</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Напр. GhostViper"
          className="w-full bg-slate-900 text-white border border-slate-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-all placeholder-slate-600 text-sm"
          required
        />
      </div>
      
      <div>
        <div className="flex justify-between items-end mb-2">
            <label className="block text-xs font-medium text-slate-400 ml-1">
                Графік (для цього гравця)
            </label>
            <div className="flex gap-2">
                <button type="button" onClick={() => setAll(1)} className="text-[10px] text-cyan-400 hover:underline">Всі ON</button>
                <button type="button" onClick={() => setAll(0)} className="text-[10px] text-red-400 hover:underline">Всі OFF</button>
            </div>
        </div>
        
        <div className="grid grid-cols-6 sm:grid-cols-8 gap-1">
          {schedule.map((status, index) => (
            <button
              key={index}
              type="button"
              onClick={() => toggleHour(index)}
              className={`
                aspect-square rounded flex flex-col items-center justify-center text-[10px] font-bold transition-all border
                ${status === 1 
                  ? 'bg-cyan-900/40 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20' 
                  : 'bg-slate-950 border-slate-800 text-slate-600 hover:bg-red-900/10 hover:border-red-900/30 pattern-diagonal-lines'}
              `}
              title={`${index}:00 - ${status === 1 ? 'Світло є' : 'Світла немає'}`}
            >
              <span>{index}</span>
            </button>
          ))}
        </div>
      </div>

      <button
        type="submit"
        className="mt-2 w-full bg-cyan-600/80 hover:bg-cyan-500 text-white font-bold py-2 px-6 rounded-lg flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg"
      >
        <UserPlus size={16} />
        <span className="whitespace-nowrap text-sm">Додати до списку</span>
      </button>
    </form>
  );
};

export default AddFriendForm;