import React, { useState, useEffect } from 'react';
import { Friend, TimeRange } from './types';
import Timeline from './components/Timeline';
import AddFriendForm from './components/AddFriendForm';
import AnalyticsPanel from './components/AnalyticsPanel';
import LoginScreen from './components/LoginScreen';
import EditScheduleModal from './components/EditScheduleModal';
import { Gamepad2, Clock, LogOut, Crown, User, Share2, Check, Edit3 } from 'lucide-react';

const App: React.FC = () => {
  const getKyivHour = () => {
    try {
      const kyivTime = new Date().toLocaleString("en-US", { timeZone: "Europe/Kiev", hour: 'numeric', hour12: false });
      return parseInt(kyivTime);
    } catch (e) {
      return new Date().getHours();
    }
  };

  const getKyivDate = () => {
    try {
      return new Date().toLocaleDateString("uk-UA", { timeZone: "Europe/Kiev", day: 'numeric', month: 'long' });
    } catch (e) {
      return new Date().toLocaleDateString("uk-UA", { day: 'numeric', month: 'long' });
    }
  };

  // State
  const [friends, setFriends] = useState<Friend[]>([]);
  const [currentHour, setCurrentHour] = useState(getKyivHour());
  const [currentDate, setCurrentDate] = useState(getKyivDate());
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string } | null>(null);
  const [groupName, setGroupName] = useState<string>("Squad");
  const [groupId, setGroupId] = useState<string>("");
  const [showInviteCopied, setShowInviteCopied] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [highlightedFriendIds, setHighlightedFriendIds] = useState<string[]>([]);

  // Sync Time
  useEffect(() => {
    const timer = setInterval(() => {
      const nowKyiv = getKyivHour();
      if (nowKyiv !== currentHour) {
        setCurrentHour(nowKyiv);
        setCurrentDate(getKyivDate());
      }
    }, 60000);
    return () => clearInterval(timer);
  }, [currentHour]);
  
  // Sort friends by online status when hour changes
  useEffect(() => {
    if (friends.length === 0) return;

    setFriends(prevFriends => {
      // Create a shallow copy to sort
      const sorted = [...prevFriends].sort((a, b) => {
        const aStatus = a.schedule[currentHour];
        const bStatus = b.schedule[currentHour];
        
        // If status differs, put Online (1) before Offline (0)
        if (aStatus !== bStatus) {
          return bStatus - aStatus;
        }
        return 0; // Keep existing order otherwise
      });

      // Avoid setting state if order hasn't changed (prevents loops)
      const isSameOrder = prevFriends.every((f, i) => f.id === sorted[i].id);
      return isSameOrder ? prevFriends : sorted;
    });
  }, [currentHour, friends.length]); // Re-run when hour changes or count changes

  // Status Calculations
  const [currentOnlineCount, setCurrentOnlineCount] = useState(0);
  const [statusDuration, setStatusDuration] = useState(1);

  useEffect(() => {
    if (friends.length === 0) {
      setCurrentOnlineCount(0);
      setStatusDuration(0);
      return;
    }

    const onlineNow = friends.filter(f => f.schedule[currentHour] === 1);
    setCurrentOnlineCount(onlineNow.length);

    let duration = 1; 
    const currentOnlineIds = onlineNow.map(f => f.id).sort().join(',');

    for (let h = currentHour + 1; h < 24; h++) {
      const onlineNext = friends.filter(f => f.schedule[h] === 1);
      const nextOnlineIds = onlineNext.map(f => f.id).sort().join(',');
      if (currentOnlineIds === nextOnlineIds) {
        duration++;
      } else {
        break;
      }
    }
    setStatusDuration(duration);
  }, [friends, currentHour]);

  // Actions
  const handleLogin = (nickName: string, gName: string, inviteGroupId?: string) => {
    const newId = Date.now().toString();
    const isFirst = friends.length === 0;
    
    // Determine Group ID (New or Joined)
    const currentGroupId = inviteGroupId || Date.now().toString(36);
    
    setGroupId(currentGroupId);
    setGroupName(gName);

    // Create current user
    const user: Friend = {
      id: newId,
      name: nickName,
      schedule: Array(24).fill(1), // Default to ON
      isHost: isFirst && !inviteGroupId // If creating new group, you are host. If joining, you are not.
    };
    
    setFriends(prev => {
        // Add new user then sort
        const newList = [...prev, user];
        return newList.sort((a, b) => b.schedule[currentHour] - a.schedule[currentHour]);
    });
    setCurrentUser({ id: newId, name: nickName });
    
    // Clean URL
    window.history.replaceState({}, document.title, window.location.pathname);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setFriends([]); 
    setGroupId("");
  };

  const handleAddFriend = (name: string, schedule: number[]) => {
    const newFriend: Friend = {
      id: Date.now().toString(),
      name,
      schedule,
      isHost: false
    };
    setFriends(prev => [...prev, newFriend].sort((a, b) => b.schedule[currentHour] - a.schedule[currentHour]));
  };

  const handleRemoveFriend = (id: string) => {
    setFriends(friends.filter((f) => f.id !== id));
    if (currentUser?.id === id) {
        handleLogout();
    }
  };

  const handleUpdateSchedule = (id: string, newSchedule: number[]) => {
    setFriends(prev => {
        const updated = prev.map(f => f.id === id ? { ...f, schedule: newSchedule } : f);
        // Re-sort after schedule update
        return updated.sort((a, b) => b.schedule[currentHour] - a.schedule[currentHour]);
    });
  };

  const handleReorderFriends = (startIndex: number, endIndex: number) => {
    const result = Array.from(friends);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    setFriends(result);
  };

  const copyInviteLink = () => {
    const url = `${window.location.origin}${window.location.pathname}?groupId=${groupId}&groupName=${encodeURIComponent(groupName)}`;
    navigator.clipboard.writeText(url);
    setShowInviteCopied(true);
    setTimeout(() => setShowInviteCopied(false), 2000);
  };

  const handleTimeRangeSelect = (range: TimeRange | null) => {
    if (!range) {
      setHighlightedFriendIds([]);
      return;
    }

    // Identify friends who are online during the entire range
    const onlineFriendIds = friends.filter(friend => {
      // Check if friend has power (1) for every hour in the range
      for (let h = range.start; h <= range.end; h++) {
        if (friend.schedule[h] !== 1) return false;
      }
      return true;
    }).map(f => f.id);

    setHighlightedFriendIds(onlineFriendIds);
  };

  // Derived state
  const isHost = friends.find(f => f.id === currentUser?.id)?.isHost || false;
  const currentUserObj = friends.find(f => f.id === currentUser?.id);

  // Render Login if not auth
  if (!currentUser) {
    return <LoginScreen onJoin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-cyan-500/30 pb-20">
      <div className="fixed top-0 left-0 w-full h-96 bg-cyan-900/20 blur-[100px] pointer-events-none rounded-b-full"></div>

      {/* Edit Modal */}
      {currentUserObj && (
        <EditScheduleModal 
            friend={currentUserObj} 
            isOpen={isEditModalOpen} 
            onClose={() => setIsEditModalOpen(false)} 
            onSave={handleUpdateSchedule}
        />
      )}

      <div className="max-w-6xl mx-auto px-4 pt-6 relative z-10">
        
        {/* Header Bar */}
        <header className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4 bg-slate-900/50 p-4 rounded-2xl border border-slate-800 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-gradient-to-br from-cyan-600 to-cyan-800 rounded-xl shadow-lg shadow-cyan-900/20">
                <Gamepad2 className="text-white w-6 h-6" />
            </div>
            <div>
                <h1 className="text-xl font-black tracking-tighter text-white uppercase leading-none flex items-center gap-2">
                   {groupName}
                   <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700 font-mono">
                     #{groupId.substring(0,4)}
                   </span>
                </h1>
                <div className="text-xs text-slate-500 font-medium mt-1">
                    Гравець: <span className="text-cyan-400 font-bold">{currentUser.name}</span> {isHost && <span className="text-yellow-500 ml-1">(Host)</span>}
                </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {isHost && (
                <button 
                    onClick={copyInviteLink}
                    className="flex items-center gap-2 px-4 py-2 bg-cyan-900/30 hover:bg-cyan-900/50 text-cyan-400 rounded-lg border border-cyan-500/30 transition-all text-xs font-bold uppercase tracking-wider"
                >
                    {showInviteCopied ? <Check size={14} /> : <Share2 size={14} />}
                    {showInviteCopied ? 'Посилання скопійовано' : 'Запросити друзів'}
                </button>
            )}
            
            <button 
                onClick={handleLogout}
                className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                title="Вийти"
            >
                <LogOut size={20} />
            </button>
          </div>
        </header>

        {/* Status Card */}
        <div className="mb-8">
            <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/30 p-6 rounded-xl border border-slate-700 backdrop-blur relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
               <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${currentOnlineCount > 0 ? 'from-green-500/10 to-transparent' : 'from-red-500/10 to-transparent'} rounded-bl-full pointer-events-none`}></div>
               
               <div className="flex items-center gap-4 z-10">
                 <div className={`p-3 rounded-full ${currentOnlineCount > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    <Clock size={32} />
                 </div>
                 <div>
                   <div className="flex items-center gap-2 mb-1 text-yellow-500">
                     <span className="text-xs uppercase font-bold tracking-wider">
                        Зараз ({currentDate}, {currentHour}:00)
                     </span>
                     {currentOnlineCount > 0 && <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>}
                   </div>
                   <div className="flex items-baseline gap-2">
                     <span className={`text-4xl font-bold ${currentOnlineCount > 0 ? 'text-white' : 'text-slate-500'}`}>
                        {currentOnlineCount}
                     </span>
                     <span className="text-lg text-slate-400">/ {friends.length} онлайн</span>
                   </div>
                 </div>
               </div>
               
               <div className="z-10 bg-slate-950/50 border border-slate-800 rounded-lg px-6 py-3 text-center min-w-[200px]">
                  <div className="text-xs text-slate-500 uppercase font-bold mb-1">Прогноз</div>
                  <div className="text-slate-200 font-mono text-lg">
                    {statusDuration > 0 ? (
                      <>Ще <span className="text-cyan-400 font-bold">{statusDuration} год.</span></>
                    ) : 'Дані відсутні'}
                  </div>
                  <div className="text-xs text-slate-600 mt-1">
                     до {Math.min(currentHour + statusDuration, 24)}:00
                  </div>
               </div>
            </div>
        </div>
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">
          
          {/* Timeline Section */}
          <div className="lg:col-span-8 space-y-6">
            <Timeline 
                friends={friends} 
                currentUserId={currentUser.id}
                onRemoveFriend={handleRemoveFriend} 
                onReorderFriends={handleReorderFriends}
                currentHour={currentHour}
                highlightedIds={highlightedFriendIds}
            />
            <AnalyticsPanel 
                friends={friends} 
                onSelectTime={handleTimeRangeSelect}
            />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* User Profile / Edit Action */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-500/5 rounded-bl-full pointer-events-none transition-transform group-hover:scale-110"></div>
                
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-slate-800 to-slate-900 rounded-full flex items-center justify-center text-cyan-400 border border-slate-700 shadow-inner">
                        <User size={24} />
                    </div>
                    <div>
                        <h3 className="text-white font-bold">{currentUser.name}</h3>
                        <p className="text-xs text-slate-500">Ваш статус та графік</p>
                    </div>
                </div>

                <button 
                    onClick={() => setIsEditModalOpen(true)}
                    className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-cyan-900/20"
                >
                    <Edit3 size={16} />
                    Редагувати мій графік
                </button>
            </div>

            {/* Host Only: Add Offline Friend */}
            {isHost && (
                <div className="space-y-2 pt-4 border-t border-slate-800/50">
                    <div className="flex items-center gap-2 text-yellow-500 text-xs font-bold uppercase tracking-wider px-1 mb-2">
                        <Crown size={12} /> Панель Хоста
                    </div>
                    <AddFriendForm onAdd={handleAddFriend} />
                </div>
            )}
            
            <div className="bg-slate-900/30 p-4 rounded-xl border border-slate-800 text-sm text-slate-400">
               <h4 className="font-bold text-slate-300 mb-2">Інструкція</h4>
               <ul className="list-disc list-inside space-y-2 ml-1 text-xs leading-relaxed">
                  <li>Натисніть <b>"Редагувати мій графік"</b>, щоб оновити дані про світло.</li>
                  {isHost && <li>Надішліть посилання друзям, щоб вони приєдналися до цього лоббі.</li>}
                  <li>Перетягуйте імена у списку для зручності.</li>
               </ul>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default App;