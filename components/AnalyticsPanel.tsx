import React, { useMemo, useState, useEffect } from 'react';
import { Friend, TimeRange } from '../types';
import { calculateOverlaps, formatTimeRange } from '../utils/analytics';
import { Trophy, Users, Clock, SlidersHorizontal } from 'lucide-react';

interface AnalyticsPanelProps {
  friends: Friend[];
  onSelectTime?: (range: TimeRange | null) => void;
}

const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({ friends, onSelectTime }) => {
  const ranges = useMemo(() => calculateOverlaps(friends), [friends]);
  const [minPlayers, setMinPlayers] = useState<number>(0);

  // Initialize or update minPlayers when friends count changes
  useEffect(() => {
    if (friends.length > 0) {
        // Default to 5, or total players if less than 5
        setMinPlayers(Math.min(friends.length, 5));
    }
  }, [friends.length]);

  if (friends.length < 2) return null;

  // Filter ranges based on slider
  const filteredRanges = ranges.filter(r => r.count >= minPlayers);

  const handleTimeClick = (range: TimeRange) => {
    if (onSelectTime) {
      onSelectTime(range);
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = parseInt(e.target.value);
      setMinPlayers(val);
      // Clear selection when filter changes to avoid confusion
      if (onSelectTime) onSelectTime(null);
  };

  return (
    <div className="space-y-4 animate-fade-in-up">
      
      {/* Header & Filter Controls */}
      <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-500">
                  <Users size={20} />
              </div>
              <div>
                  <h3 className="text-slate-200 font-bold text-sm uppercase tracking-wide">Пошук часу</h3>
                  <p className="text-xs text-slate-500">Знайдено слотів: {filteredRanges.length}</p>
              </div>
          </div>

          <div className="flex items-center gap-4 bg-slate-950 px-4 py-2 rounded-lg border border-slate-800 w-full sm:w-auto">
             <div className="flex items-center gap-2 text-slate-400">
                 <SlidersHorizontal size={14} />
                 <span className="text-xs font-bold whitespace-nowrap">Гравців:</span>
             </div>
             <div className="flex items-center gap-3 flex-1">
                 <span className="text-xs font-mono text-slate-500 w-3 text-right">2</span>
                 <input 
                    type="range" 
                    min="2" 
                    max={friends.length} 
                    step="1"
                    value={minPlayers || 2}
                    onChange={handleSliderChange}
                    className="w-full sm:w-32 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500 hover:accent-cyan-400"
                 />
                 <span className="text-sm font-bold text-cyan-400 w-3">{minPlayers}</span>
             </div>
          </div>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredRanges.length > 0 ? (
            filteredRanges.map((range, idx) => {
                const isFullSquad = range.count === friends.length;
                return (
                    <button 
                        key={`slot-${idx}`} 
                        onClick={() => handleTimeClick(range)}
                        className={`
                            relative overflow-hidden rounded-xl p-4 text-left transition-all duration-200 border group
                            ${isFullSquad 
                                ? 'bg-green-950/40 border-green-500/30 hover:bg-green-900/40 hover:border-green-400 hover:shadow-[0_0_20px_rgba(34,197,94,0.1)]' 
                                : 'bg-slate-800/40 border-slate-700 hover:bg-slate-800 hover:border-yellow-500/40'
                            }
                        `}
                    >
                        {/* Icon Background */}
                        <div className={`absolute top-0 right-0 p-3 opacity-10 transition-opacity group-hover:opacity-20 ${isFullSquad ? 'text-green-400' : 'text-slate-400'}`}>
                            {isFullSquad ? <Trophy size={40} /> : <Clock size={40} />}
                        </div>

                        {/* Content */}
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-1">
                                <span className={`text-xl font-black tracking-tight ${isFullSquad ? 'text-green-100' : 'text-slate-200 group-hover:text-white'}`}>
                                    {formatTimeRange(range.start, range.end)}
                                </span>
                            </div>
                            
                            <div className="flex items-center gap-2 text-xs mb-3">
                                <span className={`font-medium px-1.5 py-0.5 rounded ${isFullSquad ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-300'}`}>
                                    {range.duration} год
                                </span>
                                <span className="text-slate-500">•</span>
                                <span className={`${isFullSquad ? 'text-green-400 font-bold' : 'text-yellow-500'}`}>
                                    {range.count} / {friends.length} гравців
                                </span>
                            </div>

                            {/* Missing Players (only if not full squad) */}
                            {!isFullSquad && range.missingFriends.length > 0 && (
                                <div className="mt-2 pt-2 border-t border-slate-700/50">
                                    <div className="text-[10px] uppercase text-red-400/70 font-bold mb-1">Offline:</div>
                                    <div className="flex flex-wrap gap-1">
                                        {range.missingFriends.slice(0, 3).map(name => (
                                            <span key={name} className="px-1.5 py-0.5 bg-red-950/50 border border-red-900/30 text-red-300 rounded text-[10px] truncate max-w-[80px]">
                                                {name}
                                            </span>
                                        ))}
                                        {range.missingFriends.length > 3 && (
                                            <span className="text-[10px] text-slate-500 px-1">+{range.missingFriends.length - 3}</span>
                                        )}
                                    </div>
                                </div>
                            )}
                            
                            {isFullSquad && (
                                <div className="mt-2 text-xs text-green-500/80 font-medium flex items-center gap-1">
                                    <Trophy size={12} /> Ідеальний час
                                </div>
                            )}
                        </div>
                    </button>
                );
            })
        ) : (
            <div className="col-span-full py-10 text-center border border-dashed border-slate-800 rounded-xl bg-slate-900/20">
                <p className="text-slate-500 mb-2">На жаль, спільних слотів для {minPlayers} гравців не знайдено.</p>
                <button 
                    onClick={() => setMinPlayers(Math.max(2, minPlayers - 1))}
                    className="text-cyan-400 text-sm hover:underline"
                >
                    Спробуйте зменшити кількість гравців
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPanel;