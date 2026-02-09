import { useState, useRef, useEffect } from 'react';
import type { GameState, Relationship } from '../gameState';
import { generateChatResponse, createThread, type ChatThread, type ChatMessage } from '../chatAI';
import { clampStat, phoneBrands } from '../gameData';
import { PhoneGames } from './PhoneGames';

interface ChatScreenProps {
  state: GameState;
  onStateChange: (state: GameState) => void;
}

export function ChatScreen({ state, onStateChange }: ChatScreenProps) {
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [threads, setThreads] = useState<Record<string, ChatThread>>({});
  const [isTyping, setIsTyping] = useState(false);
  const [showGames, setShowGames] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Phone tier for games
  const phoneTier = state.phone?.tier ?? 0;

  // Phone features from state
  const chatLatency = state.phone?.chatLatency ?? 1500;
  const phoneBrand = state.phone?.brand === 'moto' ? 'moto' : 'noki';
  const brandFeatures = phoneBrands[phoneBrand];
  const hasEmojiReactions = brandFeatures.hasEmojiReactions;
  const relationBonus = brandFeatures.relationBonus;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [threads, activeChat]);

  // All chattable contacts
  const contacts = state.relationships.filter(r =>
    r.alive && ['friend', 'partner', 'spouse', 'sibling', 'classmate', 'coworker', 'schoolmate', 'parent', 'child'].includes(r.type)
  );

  if (state.age < 10) {
    return (
      <div className="pb-24 flex flex-col items-center justify-center pt-20">
        <div className="text-6xl mb-4">📱</div>
        <p className="text-gray-400 text-center">You don't have a phone yet!<br/>Come back when you're older.</p>
      </div>
    );
  }

  const getThread = (contactId: string): ChatThread => {
    return threads[contactId] || createThread(contactId);
  };

  const handleSend = () => {
    if (!inputText.trim() || !activeChat || isTyping) return;
    const contact = contacts.find(c => c.id === activeChat);
    if (!contact) return;

    const thread = getThread(activeChat);
    const playerMsg: ChatMessage = {
      id: 'msg_' + Date.now() + '_p',
      sender: 'player',
      text: inputText.trim(),
      timestamp: Date.now(),
    };

    const updatedThread: ChatThread = {
      ...thread,
      messages: [...thread.messages, playerMsg],
    };

    // Show player message immediately
    setThreads({ ...threads, [activeChat]: updatedThread });
    setInputText('');

    // Add typing delay based on phone tier
    if (chatLatency > 0) {
      setIsTyping(true);
    }

    setTimeout(() => {
      // Generate AI response after latency
      const aiResult = generateChatResponse(inputText, contact, updatedThread);

      const npcMsg: ChatMessage = {
        id: 'msg_' + Date.now() + '_n',
        sender: 'npc',
        text: aiResult.response,
        timestamp: Date.now(),
      };

      const finalThread: ChatThread = {
        ...updatedThread,
        messages: [...updatedThread.messages, npcMsg],
        topics: [...updatedThread.topics, aiResult.topicFound],
        mood: Math.max(-10, Math.min(10, updatedThread.mood + aiResult.moodChange)),
      };

      setThreads(prev => ({ ...prev, [activeChat]: finalThread }));
      setIsTyping(false);

      // Update relationship (Noki brand gets bonus)
      const effectiveRelChange = aiResult.relationChange !== 0 
        ? Math.round(aiResult.relationChange * (1 + relationBonus / 100))
        : 0;
      if (effectiveRelChange !== 0) {
        const newRelationships = state.relationships.map(r =>
          r.id === activeChat
            ? { ...r, relationship: clampStat(r.relationship + effectiveRelChange) }
            : r
        );
        onStateChange({ ...state, relationships: newRelationships });
      }
    }, chatLatency);
  };

  // No voice call - use games instead

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getContactIcon = (r: Relationship) => {
    if (r.type === 'partner' || r.type === 'spouse') return r.gender === 'male' ? '💑' : '💑';
    if (r.type === 'parent') return r.gender === 'male' ? '👨' : '👩';
    if (r.type === 'sibling') return r.gender === 'male' ? '👦' : '👧';
    if (r.type === 'child') return '👶';
    if (r.type === 'classmate' || r.type === 'schoolmate') return r.gender === 'male' ? '👨‍🎓' : '👩‍🎓';
    if (r.type === 'coworker') return r.gender === 'male' ? '👨‍💼' : '👩‍💼';
    return r.gender === 'male' ? '👨' : '👩';
  };

  const getStatusColor = (r: Relationship) => {
    if (r.relationship > 70) return 'bg-green-400';
    if (r.relationship > 40) return 'bg-yellow-400';
    return 'bg-red-400';
  };

  const getLastMessage = (contactId: string): string => {
    const thread = threads[contactId];
    if (!thread || thread.messages.length === 0) return 'Tap to start chatting...';
    return thread.messages[thread.messages.length - 1].text;
  };

  const getUnreadish = (contactId: string): boolean => {
    const thread = threads[contactId];
    if (!thread || thread.messages.length === 0) return false;
    return thread.messages[thread.messages.length - 1].sender === 'npc';
  };

  // ====== CHAT VIEW ======
  if (activeChat) {
    const contact = contacts.find(c => c.id === activeChat);
    if (!contact) { setActiveChat(null); return null; }
    const thread = getThread(activeChat);

    return (
      <div className="pb-24 flex flex-col h-[calc(100vh-80px)]">
        {/* Chat Header */}
        <div className="bg-gray-800 border-b border-gray-700 p-3 flex items-center gap-3 sticky top-0 z-10">
          <button onClick={() => setActiveChat(null)} className="text-gray-400 hover:text-white text-xl">
            ←
          </button>
          <span className="text-2xl">{getContactIcon(contact)}</span>
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-sm truncate">{contact.name}</p>
            <div className="flex items-center gap-2">
              <p className="text-gray-400 text-xs capitalize">{contact.type}</p>
              <div className={`w-2 h-2 rounded-full ${getStatusColor(contact)}`}></div>
              <p className="text-gray-500 text-xs">{contact.relationship}%</p>
            </div>
          </div>
          {phoneTier >= 1 && (
            <button onClick={() => setShowGames(true)} className="bg-purple-500 hover:bg-purple-400 text-white w-8 h-8 rounded-full flex items-center justify-center text-lg">
              🎮
            </button>
          )}
          <div className="text-right">
            <p className="text-gray-500 text-[10px]">{contact.personality.temperament}</p>
            <p className="text-gray-600 text-[10px]">
              {contact.personality.friendliness > 60 ? '😊' : '😐'}
              {contact.personality.humor > 60 ? '😂' : ''}
              {contact.personality.intelligence > 60 ? '🧠' : ''}
            </p>
          </div>
        </div>

        {/* Games accessible from contacts list */}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {thread.messages.length === 0 && (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">{getContactIcon(contact)}</div>
              <p className="text-gray-500 text-sm">Start chatting with {contact.name}!</p>
              <p className="text-gray-600 text-xs mt-1">They're {contact.personality.temperament} and {contact.personality.friendliness > 60 ? 'friendly' : 'reserved'}</p>
              <div className="flex flex-wrap gap-2 justify-center mt-4">
                {['Hey!', 'What\'s up?', 'How are you?', 'Wanna hang out?'].map(quick => (
                  <button key={quick} onClick={() => { setInputText(quick); }}
                    className="bg-gray-700 text-gray-300 px-3 py-1.5 rounded-full text-xs hover:bg-gray-600 transition-all">
                    {quick}
                  </button>
                ))}
              </div>
            </div>
          )}

          {thread.messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.sender === 'player' ? 'justify-end' : 'justify-start'} group`}>
              <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${
                msg.sender === 'player'
                  ? 'bg-emerald-600 text-white rounded-br-sm'
                  : 'bg-gray-700 text-gray-200 rounded-bl-sm'
              }`}>
                {msg.text}
                {/* Moto phones have emoji reactions */}
                {hasEmojiReactions && msg.sender === 'npc' && (
                  <div className="flex gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {['❤️', '😂', '👍', '😮'].map(emoji => (
                      <button key={emoji} onClick={() => setInputText(emoji)}
                        className="text-xs hover:scale-125 transition-transform">{emoji}</button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-700 text-gray-400 px-3 py-2 rounded-2xl rounded-bl-sm text-sm flex items-center gap-1">
                <span className="animate-bounce">.</span>
                <span className="animate-bounce" style={{ animationDelay: '0.1s' }}>.</span>
                <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>.</span>
                <span className="ml-1 text-gray-500 text-xs">typing</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Topics */}
        {thread.messages.length > 0 && (
          <div className="px-3 py-1 flex gap-1.5 overflow-x-auto">
            {['😂 Lol', '👍 Nice', '❤️ Love that', '🎉 Party?', '📚 School', '💼 Work', '🍕 Food?', '😢 I\'m sad'].map(quick => (
              <button key={quick} onClick={() => setInputText(quick.split(' ').slice(1).join(' '))}
                className="bg-gray-800 text-gray-400 px-2.5 py-1 rounded-full text-xs whitespace-nowrap hover:bg-gray-700 hover:text-gray-300 transition-all border border-gray-700 flex-shrink-0">
                {quick}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="bg-gray-800 border-t border-gray-700 p-2 flex gap-2 items-end">
          <input
            type="text"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${contact.name}...`}
            className="flex-1 bg-gray-700 text-white rounded-full px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500 placeholder-gray-500"
            maxLength={200}
          />
          <button
            onClick={handleSend}
            disabled={!inputText.trim()}
            className={`w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all ${
              inputText.trim()
                ? 'bg-emerald-500 hover:bg-emerald-400 active:scale-90 text-white'
                : 'bg-gray-700 text-gray-500'
            }`}
          >
            ↑
          </button>
        </div>
      </div>
    );
  }

  // ====== CONTACTS LIST ======
  return (
    <div className="pb-24 space-y-3">
      {/* Phone Header */}
      <div className={`bg-gradient-to-r ${phoneBrand === 'noki' ? 'from-blue-600 to-indigo-600' : 'from-green-600 to-emerald-600'} rounded-2xl p-4 flex items-center gap-3`}>
        <div className="text-3xl">{state.phone?.tier >= 2 ? '📲' : state.phone?.tier === 1 ? '📱' : '📟'}</div>
        <div className="flex-1">
          <h3 className="text-white font-bold text-lg">Messages</h3>
          <p className="text-emerald-100 text-xs">{contacts.length} contacts • Tap to chat</p>
        </div>
        <div className="text-right">
          <p className="text-emerald-100 text-xs font-medium">{state.phone?.name || 'NokiBrick'}</p>
          <p className="text-emerald-200 text-[10px]">
            {chatLatency > 0 ? `${chatLatency / 1000}s delay` : '⚡ Instant'}
            {phoneTier >= 1 ? ' • 🎮' : ''}
          </p>
        </div>
      </div>

      {/* Games Button */}
      {phoneTier >= 1 && (
        <button onClick={() => setShowGames(true)}
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-3 flex items-center gap-3 hover:from-purple-500 hover:to-indigo-500 transition-all">
          <span className="text-2xl">🎮</span>
          <div className="flex-1 text-left">
            <p className="text-white font-bold text-sm">Phone Games</p>
            <p className="text-purple-200 text-xs">{phoneTier >= 3 ? '3 games unlocked' : phoneTier >= 2 ? '2 games unlocked' : '1 game unlocked'}</p>
          </div>
          <span className="text-white text-lg">→</span>
        </button>
      )}

      {/* Games Modal */}
      {showGames && (
        <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col">
          <div className="bg-gray-800 p-3 flex items-center gap-3 border-b border-gray-700">
            <button onClick={() => setShowGames(false)} className="text-gray-400 hover:text-white text-xl">←</button>
            <span className="text-xl">🎮</span>
            <p className="text-white font-bold">Phone Games</p>
          </div>
          <div className="flex-1 overflow-y-auto">
            <PhoneGames tier={phoneTier} />
          </div>
        </div>
      )}

      {/* Search hint */}
      <div className="bg-gray-800 rounded-xl px-4 py-2.5 border border-gray-700 flex items-center gap-2">
        <span className="text-gray-500">🔍</span>
        <span className="text-gray-500 text-sm">Chat with friends, family & more</span>
      </div>

      {/* Contact List */}
      {contacts.length === 0 ? (
        <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700 text-center">
          <div className="text-4xl mb-3">📵</div>
          <p className="text-gray-400">No contacts yet!</p>
          <p className="text-gray-500 text-xs mt-1">Make friends at school or work first.</p>
        </div>
      ) : (
        <div className="space-y-1">
          {/* Favorites / Close relationships first */}
          {contacts
            .sort((a, b) => {
              // Sort by: partners first, then by relationship %
              const typePriority: Record<string, number> = { spouse: 0, partner: 1, friend: 2, sibling: 3, parent: 4, child: 5, classmate: 6, schoolmate: 7, coworker: 8 };
              const aPri = typePriority[a.type] ?? 9;
              const bPri = typePriority[b.type] ?? 9;
              if (aPri !== bPri) return aPri - bPri;
              return b.relationship - a.relationship;
            })
            .map(contact => {
              const hasUnread = getUnreadish(contact.id);
              const lastMsg = getLastMessage(contact.id);
              return (
                <button
                  key={contact.id}
                  onClick={() => setActiveChat(contact.id)}
                  className={`w-full bg-gray-800 hover:bg-gray-750 rounded-xl p-3 flex items-center gap-3 text-left transition-all border ${hasUnread ? 'border-emerald-500/30' : 'border-gray-700/50'} hover:border-gray-600`}
                >
                  <div className="relative">
                    <span className="text-2xl">{getContactIcon(contact)}</span>
                    <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-gray-800 ${getStatusColor(contact)}`}></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={`font-medium text-sm truncate ${hasUnread ? 'text-white' : 'text-gray-300'}`}>
                        {contact.name}
                      </p>
                      <span className="text-gray-600 text-[10px] capitalize ml-2 flex-shrink-0">{contact.type}</span>
                    </div>
                    <p className={`text-xs truncate ${hasUnread ? 'text-gray-300' : 'text-gray-500'}`}>
                      {lastMsg}
                    </p>
                  </div>
                  {hasUnread && (
                    <div className="w-2 h-2 bg-emerald-400 rounded-full flex-shrink-0"></div>
                  )}
                </button>
              );
            })
          }
        </div>
      )}
    </div>
  );
}
