import React, { useState, useRef } from 'react';
import { Friend } from '../types';
import { HOURS_AXIS } from '../constants';
import { Trash2, Zap, ZapOff, GripVertical, Crown, User, AlertTriangle } from 'lucide-react';

interface TimelineProps {
  friends: Friend[];
  currentUserId: string | null;
  onRemoveFriend: (id: string) => void;
  onReorderFriends: (startIndex: number, endIndex: number) => void;
  currentHour: number;
  highlightedIds?: string[];
}

const Timeline: React.FC<TimelineProps> = ({ 
  friends, 
  currentUserId,
  onRemoveFriend, 
  onReorderFriends,
  currentHour,
  highlightedIds = []
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, position: number) => {
    dragItem.current = position;
    setDraggedIndex(position);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>, position: number) => {
    e.preventDefault();
    dragOverItem.current = position;
  };

  const handleDragEnd = () => {
    if (dragItem.current !== null && dragOverItem.current !== null) {
      onReorderFriends(dragItem.current, dragOverItem.current);
    }
    dragItem.current = null;
    dragOverItem.current = null;
    setDraggedIndex(null);
  };

  const confirmDelete = () => {
    if (deleteConfirmId) {
      onRemoveFriend(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  // Check if current user is Host
  const isCurrentUserHost = friends.find(f => f.id === currentUserId)?.isHost;
  const friendToDelete = friends.find(f => f.id === deleteConfirmId);

  return (
    <>
      <div className="w-full overflow-x-auto bg-slate-800/50 rounded-xl border border-slate-700 p-4 shadow-xl backdrop-blur-sm">
        <div className="min-w-[800px]">
          {/* Header Row (Hours) */}
          <div className="flex mb-4 pl-8"> 
            <div className="w-40 flex-shrink-0 text-slate-400 font-bold text-sm uppercase tracking-wider pl-2">Гравець</div>
            <div className="w-10 flex-shrink-0"></div> {/* Spacer for delete button column */}
            <div className="flex-1 grid grid-cols-24 gap-px">
              {HOURS_AXIS.map((h) => (
                <div 
                  key={h} 
                  className={`text-center text-xs ${h === currentHour ? 'text-yellow-400 font-bold' : 'text-slate-500'}`}
                >
                  {h}
                </div>
              ))}
            </div>
          </div>

          {/* Friend Rows */}
          <div className="space-y-2 relative">
            {friends.map((friend, index) => {
              const hours = friend.schedule || Array(24).fill(0);
              const isMe = friend.id === currentUserId;
              const canDelete = isCurrentUserHost || isMe; 
              const isDragging = draggedIndex === index;
              const isHighlighted = highlightedIds.includes(friend.id);
              const isOnline = hours[currentHour] === 1;

              return (
                <div 
                  key={friend.id} 
                  className={`flex items-center group rounded-lg transition-all duration-300 ${
                    isHighlighted 
                        ? 'bg-yellow-900/20 border border-yellow-500/50 shadow-[0_0_15px_rgba(250,204,21,0.1)] z-10 scale-[1.01]' 
                        : isMe 
                            ? 'bg-cyan-950/30 border border-cyan-500/20' 
                            : 'hover:bg-slate-800/50 border border-transparent'
                  } ${isDragging ? 'opacity-40' : 'opacity-100'}`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragEnter={(e) => handleDragEnter(e, index)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => e.preventDefault()}
                >
                  {/* Drag Handle */}
                  <div className="w-8 flex-shrink-0 flex justify-center cursor-grab active:cursor-grabbing text-slate-600 hover:text-slate-400">
                    <GripVertical size={16} />
                  </div>

                  {/* Name Column */}
                  <div className="w-40 flex-shrink-0 pr-4 py-2">
                    <div className="flex items-center gap-2">
                      <div className={`font-semibold truncate max-w-[100px] transition-colors ${isHighlighted ? 'text-yellow-400' : 'text-slate-200'}`}>
                        {friend.name}
                      </div>
                      
                      {/* User Icon: Blue if Online, Gray if Offline */}
                      <div title={isMe ? "Ви" : "Гравець"}>
                        <User 
                          size={12} 
                          className={isOnline ? "text-cyan-400" : "text-slate-500"} 
                        />
                      </div>
                      
                      {/* Crown Icon only for Host */}
                      {friend.isHost && (
                        <div title="Host">
                            <Crown size={12} className="text-yellow-500" />
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      {isOnline ? (
                        <span className="text-green-500 flex items-center gap-0.5">
                          <Zap size={10} fill="currentColor" /> Online
                        </span>
                      ) : (
                        <span className="text-red-500 flex items-center gap-0.5">
                          <ZapOff size={10} /> Offline
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Delete Action (Moved between Name and Graph) */}
                  <div className="w-10 flex-shrink-0 flex justify-center items-center">
                    {canDelete && (
                      <button
                        onClick={() => setDeleteConfirmId(friend.id)}
                        className="p-1.5 text-slate-600 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                        title={isMe ? "Покинути загін" : "Видалити"}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>

                  {/* Timeline Bar - READ ONLY */}
                  <div className="flex-1 h-10 rounded-md overflow-hidden bg-slate-900 grid grid-cols-24 border border-slate-700/50 relative ml-1">
                     {/* Current time indicator line */}
                     <div 
                        className="absolute top-0 bottom-0 border-l-2 border-yellow-500/50 z-10 pointer-events-none"
                        style={{ left: `${(currentHour / 24) * 100}%` }}
                     />

                    {hours.map((status, hourIndex) => (
                      <div
                        key={hourIndex}
                        className={`h-full relative
                          ${status === 1 
                            ? (isHighlighted ? 'bg-yellow-500/20 border-r border-yellow-500/10' : 'bg-cyan-500/20 border-r border-cyan-500/10') 
                            : 'bg-slate-950/80 pattern-diagonal-lines'}
                          cursor-default transition-colors duration-300
                        `}
                      >
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Legend */}
        <div className="mt-4 flex justify-end items-center text-xs text-slate-500 px-2">
           <div className="flex gap-4">
              <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-cyan-500/20 border border-cyan-500/10 rounded"></div>
                  <span>ON</span>
              </div>
              <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-slate-900 border border-slate-700 rounded pattern-diagonal-lines"></div>
                  <span>OFF</span>
              </div>
           </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in-up">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-sm rounded-2xl shadow-2xl p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-red-900/30 rounded-full flex items-center justify-center text-red-500 mb-4">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Видалити гравця?</h3>
              <p className="text-slate-400 text-sm mb-6">
                Ви дійсно хочете видалити <span className="text-white font-bold">{friendToDelete?.name}</span> зі списку? Це дію не можна відмінити.
              </p>
              
              <div className="flex w-full gap-3">
                <button 
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors font-medium"
                >
                  Скасувати
                </button>
                <button 
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold shadow-lg shadow-red-900/20 transition-all active:scale-95"
                >
                  Так, видалити
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Timeline;