import React, { useState, useEffect } from 'react';
import { Power, ArrowRight, Users, Link as LinkIcon } from 'lucide-react';

interface LoginScreenProps {
  onJoin: (nickName: string, groupName: string, groupId?: string) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onJoin }) => {
  const [nickName, setNickName] = useState('');
  const [groupName, setGroupName] = useState('');
  const [isInvite, setIsInvite] = useState(false);
  const [inviteGroupId, setInviteGroupId] = useState<string | undefined>(undefined);

  useEffect(() => {
    // Check for URL params
    const params = new URLSearchParams(window.location.search);
    const gId = params.get('groupId');
    const gName = params.get('groupName');

    if (gId && gName) {
      setIsInvite(true);
      setInviteGroupId(gId);
      setGroupName(decodeURIComponent(gName));
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nickName.trim() && groupName.trim()) {
      onJoin(nickName, groupName, inviteGroupId);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative z-20">
      <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-md p-8 rounded-2xl border border-slate-700 shadow-2xl animate-fade-in-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-4 bg-cyan-950/30 rounded-full mb-4 border border-cyan-500/20">
            <Power className="text-cyan-400 w-10 h-10" />
          </div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">
            PowerSquad
          </h1>
          <p className="text-slate-400 text-sm">
            {isInvite 
              ? "Вас запрошено до ігрового загону" 
              : "Створіть свій загін для синхронізації графіків"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Group Name Field */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1 flex items-center gap-2">
              <Users size={12} /> Назва Загону (Лоббі)
            </label>
            <div className="relative">
              <input
                type="text"
                value={groupName}
                onChange={(e) => !isInvite && setGroupName(e.target.value)}
                readOnly={isInvite}
                placeholder="Напр. Dota Dream Team"
                className={`w-full bg-slate-950 text-white border-2 rounded-xl px-5 py-3 text-lg focus:outline-none transition-colors placeholder-slate-700
                  ${isInvite 
                    ? 'border-slate-800 text-slate-400 cursor-not-allowed' 
                    : 'border-slate-800 focus:border-cyan-500'
                  }`}
                required
              />
              {isInvite && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-cyan-500">
                  <LinkIcon size={16} />
                </div>
              )}
            </div>
          </div>

          {/* Nickname Field */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">
              Ваш Нікнейм
            </label>
            <input
              type="text"
              value={nickName}
              onChange={(e) => setNickName(e.target.value)}
              placeholder="Введіть нікнейм..."
              className="w-full bg-slate-950 text-white border-2 border-slate-800 focus:border-cyan-500 rounded-xl px-5 py-3 text-lg focus:outline-none transition-colors placeholder-slate-700"
              autoFocus
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-cyan-900/20 group"
          >
            <span>{isInvite ? 'Приєднатися до Загону' : 'Створити Загін'}</span>
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-slate-600">
          Синхронізація відключень • Планування рейдів • UA
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;