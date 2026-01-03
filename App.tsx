
import React, { useState, useEffect } from 'react';
import { GameLevel, RoomState, UserSession, PreferenceScore } from './types';
import { TheMatcher } from './components/TheMatcher';
import { GameTable } from './components/GameTable';
import { INVENTORY } from './constants';

const App: React.FC = () => {
  const [step, setStep] = useState<'welcome' | 'role' | 'setup' | 'matcher' | 'inventory' | 'share' | 'game'>('welcome');
  const [room, setRoom] = useState<RoomState>({
    id: 'room-' + Math.random().toString(36).substr(2, 5),
    level: GameLevel.SPARK,
    activeTurn: 'Partner A',
    isSyncing: false
  });

  const [localUser, setLocalUser] = useState<Partial<UserSession>>({
    role: 'Partner A',
    name: '',
    gender: 'M',
    inventory: []
  });

  const [syncLink, setSyncLink] = useState('');

  // Эффект для обработки входящей ссылки синхронизации
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.startsWith('#sync=')) {
      try {
        const encodedData = hash.replace('#sync=', '');
        const partnerData = JSON.parse(atob(encodedData));
        
        // Если мы перешли по ссылке, мы автоматически становимся Партнером Б
        setLocalUser(prev => ({ 
          ...prev, 
          role: 'Partner B' 
        }));
        
        setRoom(prev => ({
          ...prev,
          partnerA: partnerData // Записываем данные Партнера А из ссылки
        }));
        
        setStep('setup');
      } catch (e) {
        console.error("Ошибка синхронизации данных", e);
      }
    }
  }, []);

  const handleStart = () => setStep('role');
  
  const selectRole = (role: 'Partner A' | 'Partner B') => {
    if (role === 'Partner B' && !room.partnerA) {
      alert("Для роли Партнера Б нужна ссылка от Партнера А");
      return;
    }
    setLocalUser({ ...localUser, role });
    setStep('setup');
  };

  const handleCompleteSetup = (e: React.FormEvent) => {
    e.preventDefault();
    if (localUser.name) setStep('matcher');
  };

  const handlePreferences = (prefs: Record<string, PreferenceScore>) => {
    setLocalUser(prev => ({ ...prev, preferences: prefs }));
    setStep('inventory');
  };

  const toggleInventory = (id: string) => {
    setLocalUser(prev => {
      const inv = prev.inventory || [];
      const newInv = inv.includes(id) ? inv.filter(i => i !== id) : [...inv, id];
      return { ...prev, inventory: newInv };
    });
  };

  const finalizeSession = () => {
    if (localUser.role === 'Partner A') {
      // Генерируем ссылку для Партнера Б
      const userData = {
        name: localUser.name,
        gender: localUser.gender,
        preferences: localUser.preferences,
        inventory: localUser.inventory,
        role: 'Partner A'
      };
      const encoded = btoa(JSON.stringify(userData));
      const url = `${window.location.origin}${window.location.pathname}#sync=${encoded}`;
      setSyncLink(url);
      setStep('share');
    } else {
      // Партнер Б завершил настройку, можно начинать
      setRoom(prev => ({
        ...prev,
        partnerB: localUser as UserSession
      }));
      setStep('game');
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(syncLink);
    alert("Ссылка скопирована! Отправьте её партнеру.");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 selection:bg-rose-500/30 gradient-bg font-sans">
      <header className="p-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center font-bold italic shadow-lg shadow-rose-900/40">S</div>
          <h1 className="text-xl font-serif font-bold tracking-tight">Seduction<span className="text-rose-600">Sync</span></h1>
        </div>
        {step === 'game' && (
          <div className="flex items-center gap-4">
             <div className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Sync
            </div>
            <div className="text-xs text-slate-500">{localUser.name}</div>
          </div>
        )}
      </header>

      <main className="container mx-auto max-w-lg px-4 pb-20">
        {step === 'welcome' && (
          <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
            <h2 className="text-5xl md:text-6xl font-serif mb-6 leading-tight">Ваше общее<br/><span className="italic text-rose-500">тайное приключение.</span></h2>
            <p className="text-slate-400 text-lg mb-10">
              Синхронизируйте желания через приватную ссылку. Никаких серверов, только ваши устройства.
            </p>
            <button 
              onClick={handleStart}
              className="px-10 py-4 bg-rose-600 hover:bg-rose-500 rounded-2xl font-bold text-lg transition-all shadow-xl shadow-rose-900/20 active:scale-95"
            >
              Начать игру
            </button>
          </div>
        )}

        {step === 'role' && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <h2 className="text-3xl font-serif mb-8 text-rose-500">Кто начинает?</h2>
            <div className="grid grid-cols-1 gap-4 w-full">
              <button 
                onClick={() => selectRole('Partner A')}
                className="p-6 rounded-2xl border border-slate-800 bg-slate-900 hover:border-rose-500 transition-all text-left group"
              >
                <div className="text-rose-500 font-bold mb-1 group-hover:translate-x-1 transition-transform">Я создаю сессию →</div>
                <div className="text-slate-400 text-sm">Вы настроите игру и отправите секретную ссылку партнеру.</div>
              </button>
              <div className="p-6 rounded-2xl border border-slate-900 bg-slate-950 opacity-60 text-left">
                <div className="text-slate-500 font-bold mb-1 italic">Я присоединяюсь</div>
                <div className="text-slate-600 text-sm">Чтобы присоединиться, просто откройте ссылку, которую прислал партнер.</div>
              </div>
            </div>
          </div>
        )}

        {step === 'setup' && (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
             <h2 className="text-3xl font-serif text-rose-500 mb-8">
               {localUser.role === 'Partner B' ? `Присоединение к ${room.partnerA?.name}` : 'Настройка профиля'}
             </h2>
             <form onSubmit={handleCompleteSetup} className="w-full space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Ваше имя</label>
                  <input 
                    required
                    type="text" 
                    value={localUser.name}
                    onChange={e => setLocalUser({...localUser, name: e.target.value})}
                    placeholder="Например, Алекс"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 focus:border-rose-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-4 text-center">Ваш пол</label>
                  <div className="grid grid-cols-3 gap-3">
                    {['M', 'F', 'NB'].map(g => (
                      <button 
                        key={g} type="button"
                        onClick={() => setLocalUser({...localUser, gender: g as any})}
                        className={`py-3 rounded-xl border transition-all ${localUser.gender === g ? 'bg-rose-900/30 border-rose-500 text-rose-400' : 'bg-slate-900 border-slate-800 text-slate-500'}`}
                      >
                        {g === 'M' ? 'Муж' : g === 'F' ? 'Жен' : 'НБ'}
                      </button>
                    ))}
                  </div>
                </div>
                <button type="submit" className="w-full py-4 bg-slate-100 text-slate-950 font-bold rounded-xl mt-4">Далее</button>
             </form>
          </div>
        )}

        {step === 'matcher' && <TheMatcher onComplete={handlePreferences} />}

        {step === 'inventory' && (
          <div className="flex flex-col items-center min-h-[60vh] py-8">
            <h2 className="text-3xl font-serif text-rose-500 mb-2">Инвентарь</h2>
            <p className="text-slate-400 text-sm mb-10 text-center">Выберите предметы, которые физически доступны вам сейчас.</p>
            <div className="grid grid-cols-2 gap-4 w-full">
              {INVENTORY.map(item => (
                <button 
                  key={item.id}
                  onClick={() => toggleInventory(item.id)}
                  className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${localUser.inventory?.includes(item.id) ? 'bg-rose-900/20 border-rose-500 shadow-lg' : 'bg-slate-900 border-slate-800'}`}
                >
                  <span className="text-2xl">{item.icon}</span>
                  <span className="text-sm font-semibold">{item.label}</span>
                </button>
              ))}
            </div>
            <button 
              onClick={finalizeSession} 
              className="w-full py-4 bg-rose-600 font-bold rounded-xl mt-12 shadow-xl shadow-rose-900/30"
            >
              {localUser.role === 'Partner A' ? 'Создать ссылку синхронизации' : 'Завершить и начать'}
            </button>
          </div>
        )}

        {step === 'share' && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="w-20 h-20 bg-rose-600/20 rounded-full flex items-center justify-center mb-8">
              <span className="text-4xl">🔗</span>
            </div>
            <h2 className="text-2xl font-serif mb-4">Отправьте ссылку партнеру</h2>
            <p className="text-slate-400 mb-8 italic">Ваш партнер должен открыть её на своем телефоне и пройти свою настройку.</p>
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 w-full mb-8 font-mono text-[10px] break-all text-slate-300">
              {syncLink}
            </div>
            <button 
              onClick={copyLink}
              className="w-full py-4 bg-rose-600 font-bold rounded-xl mb-4"
            >
              Копировать ссылку
            </button>
            <p className="text-slate-500 text-xs">Как только партнер перейдет по ссылке и закончит настройку, вы сможете начать игру на одном из устройств (или следовать ходам на обоих).</p>
            <button 
              onClick={() => setStep('game')}
              className="mt-8 text-rose-500 text-sm font-bold border-b border-rose-500"
            >
              Я уже отправил, начать игру (ожидая партнера)
            </button>
          </div>
        )}

        {step === 'game' && (
          <GameTable 
            room={room} 
            onUpdateLevel={(lvl) => setRoom(prev => ({ ...prev, level: lvl }))}
            onTurnComplete={() => setRoom(prev => ({ ...prev, activeTurn: prev.activeTurn === 'Partner A' ? 'Partner B' : 'Partner A' }))}
          />
        )}
      </main>
      <footer className="py-8 text-center border-t border-slate-900/50 mt-12">
        <p className="text-slate-600 text-[10px] font-bold uppercase tracking-[0.3em]">Seduction Sync PWA • No Server Required</p>
      </footer>
    </div>
  );
};

export default App;
