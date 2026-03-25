"use client";

import { useState } from "react";
import { X, Gamepad2, Trophy, Dice5, Grid3X3, ExternalLink } from "lucide-react";

interface Game {
  id: string;
  name: string;
  description: string;
  url: string;
  icon: React.ReactNode;
  color: string;
}

const GAMES: Game[] = [
  {
    id: "ludo",
    name: "Ludo King",
    description: "The official Ludo King experience. Play the world's favorite board game!",
    url: "https://ludoking.com/",
    icon: <Dice5 className="w-8 h-8" />,
    color: "bg-red-500",
  },
  {
    id: "sudoku",
    name: "Sudoku.com",
    description: "Classic Sudoku puzzles from the official Sudoku.com site.",
    url: "https://sudoku.com/",
    icon: <Grid3X3 className="w-8 h-8" />,
    color: "bg-blue-500",
  },
];

export default function GameZone() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeGame, setActiveGame] = useState<Game | null>(null);

  const toggleModal = () => setIsOpen(!isOpen);
  const closeGame = () => setActiveGame(null);

  const openInPop = (url: string) => {
    const width = 800;
    const height = 900;
    const left = (window.innerWidth - width) / 2;
    const top = (window.innerHeight - height) / 2;
    window.open(url, '_blank', `width=${width},height=${height},left=${left},top=${top},menubar=no,status=no`);
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={toggleModal}
        className="fixed bottom-6 right-6 z-40 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white p-4 rounded-full shadow-[0_0_20px_rgba(79,70,229,0.5)] hover:shadow-[0_0_30px_rgba(79,70,229,0.7)] hover:scale-110 active:scale-95 transition-all group overflow-hidden border-2 border-white/30"
        aria-label="Play Games"
      >
        <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity" />
        <Gamepad2 className="w-8 h-8 relative z-10 drop-shadow-lg" />
      </button>

      {/* Game Selection Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-indigo-950/40 backdrop-blur-md transition-opacity" 
            onClick={() => setIsOpen(false)}
          />
          
          <div className="relative bg-white dark:bg-gray-950 w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-[0_32px_128px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-300 border border-white/20">
            {/* Header with Gradient Background */}
            <div className="relative p-10 pb-8 overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-600/5 via-purple-600/5 to-pink-500/5 -z-10" />
               <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl animate-pulse" />
               <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl" />

              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-2 rounded-xl shadow-lg shadow-indigo-200">
                      <Trophy className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-500 drop-shadow-sm">
                      Fun Zone Level 1
                    </span>
                  </div>
                  <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter mb-2">
                    Bored while waiting? 🎮
                  </h2>
                  <p className="text-gray-500 font-bold text-lg">Your food is cooking, let's play!</p>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-3 bg-gray-100 hover:bg-red-50 hover:text-red-500 dark:bg-gray-800 dark:hover:bg-red-900/30 rounded-2xl transition-all relative z-[80]"
                  aria-label="Close"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Game List with Enhanced Cards */}
            <div className="px-10 pb-10 pt-2 grid grid-cols-1 md:grid-cols-2 gap-8">
              {GAMES.map((game) => (
                <div
                  key={game.id}
                  className="group relative flex flex-col items-center p-8 bg-white dark:bg-gray-900 rounded-[2.5rem] border-2 border-gray-100 dark:border-gray-800 hover:border-indigo-500/30 dark:hover:border-indigo-400/30 transition-all hover:shadow-[0_20px_50px_rgba(79,70,229,0.15)] hover:-translate-y-2 text-center overflow-hidden"
                >
                  {/* Subtle top gradient on card */}
                  <div className={`absolute top-0 inset-x-0 h-2 opacity-50 ${game.color}`} />

                  <div className={`p-6 rounded-[2rem] ${game.color} text-white mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all shadow-xl shadow-${game.color.split('-')[1]}-200`}>
                    {game.icon}
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">
                    {game.name}
                  </h3>
                  <p className="text-sm text-gray-500 font-bold leading-relaxed mb-8 px-2 opacity-80 group-hover:opacity-100 transition-opacity">
                    {game.description}
                  </p>
                  
                  <div className="flex gap-3 w-full">
                    <button
                      onClick={() => setActiveGame(game)}
                      className="flex-1 bg-gradient-to-r from-gray-900 to-gray-800 dark:from-indigo-600 dark:to-purple-600 text-white font-black py-4 rounded-2xl hover:scale-[1.05] active:scale-[0.95] transition-all shadow-lg hover:shadow-indigo-500/20"
                    >
                      Play Now
                    </button>
                    <button
                      onClick={() => openInPop(game.url)}
                      className="p-4 bg-gray-100 dark:bg-gray-800 border-2 border-transparent text-gray-900 dark:text-white rounded-2xl hover:bg-white dark:hover:bg-gray-700 hover:border-indigo-500 shadow-sm transition-all"
                      title="Open in Popup"
                    >
                      <ExternalLink className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Hint with Gradient Line */}
            <div className="p-8 bg-gray-50/50 dark:bg-gray-900/50 text-center relative">
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent" />
              <p className="text-xs font-black text-indigo-400/80 uppercase tracking-widest flex items-center justify-center gap-3">
                <span className="w-8 h-[2px] bg-indigo-100 dark:bg-gray-800" />
                Selected: Play in-app or as a popup
                <span className="w-8 h-[2px] bg-indigo-100 dark:bg-gray-800" />
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Active Game Iframe Overlay */}
      {activeGame && (
        <div className="fixed inset-0 z-[60] flex flex-col bg-black/98 backdrop-blur-2xl animate-in fade-in duration-500">
          <div className="flex justify-between items-center p-6 bg-white/5 backdrop-blur-xl border-b border-white/10">
            <div className="flex items-center gap-6">
              <div className={`p-2 rounded-2xl ${activeGame.color} text-white shadow-lg`}>
                {activeGame.icon}
              </div>
              <div>
                <span className="text-white font-black text-2xl tracking-tighter block">{activeGame.name}</span>
                <span className="text-white/40 text-xs font-bold uppercase tracking-widest">Original Version</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                 onClick={() => openInPop(activeGame.url)}
                 className="px-6 py-3 bg-white/10 hover:bg-indigo-600 text-white rounded-2xl transition-all border border-white/20 flex items-center gap-3 text-sm font-black shadow-lg"
              >
                <ExternalLink className="w-5 h-5" />
                Pop Out
              </button>
              <button 
                onClick={closeGame}
                className="px-8 py-3 bg-red-500 hover:bg-red-600 text-white font-black rounded-2xl transition-all shadow-2xl shadow-red-500/40 border border-white/20 active:scale-95"
              >
                Quit Game
              </button>
            </div>
          </div>
          
          <div className="flex-1 w-full bg-white relative">
            <div className="absolute inset-0 flex items-center justify-center -z-10 bg-gray-950">
               <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
            <iframe 
              src={activeGame.url}
              className="w-full h-full border-0 animate-in zoom-in-95 duration-500"
              allow="autoplay; fullscreen; pointer-lock"
              title={activeGame.name}
            />
          </div>
        </div>
      )}
    </>
  );
}
