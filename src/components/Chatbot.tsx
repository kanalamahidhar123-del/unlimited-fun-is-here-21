import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { SITE } from '@/data/site';

interface Message {
  role: 'bot' | 'user';
  text: string;
}

const GREETING = `Hi! 👋 Welcome to Unlimited Fun. How can I help you?`;

const FALLBACK = `I don't have that information yet. Please contact the Unlimited Fun team at ${SITE.phone}.`;

interface Rule {
  keywords: string[];
  answer: string;
}

const RULES: Rule[] = [
  {
    keywords: ['price', 'entha', 'kitna', 'cost', 'ticket', 'fee', 'how much', 'rate', '₹', 'rupee', 'dabbu', 'charges'],
    answer: `Here are our ticket prices:\n\n🏃 TRAMPOLINE PARK (5+ yrs / 2.5ft+):\n• 30 Mins — ₹300\n• 1 Hour — ₹500\n• 2 Hours — ₹850 (Best Value)\n• 3 Hours — ₹1,100\n\n🧸 SOFT PLAY (Below 5 yrs / 2.5ft):\n• 30 Mins — ₹200\n• 1 Hour — ₹350\n• 2 Hours — ₹600\n• 3 Hours — ₹800\n\n💳 RFID Cards: Basic — ₹100, Premium — ₹500\n\n⚠️ Participants must be below ${SITE.weightLimit}.`,
  },
  {
    keywords: ['timing', 'time', 'open', 'close', 'hours', 'enti', 'samayam', 'ghanta', 'ghadiya', 'when open', 'working'],
    answer: `We are open all days from ${SITE.hours}. ${SITE.workingDays}.`,
  },
  {
    keywords: ['opening', 'launch', 'grand opening', 'start', 'open date', 'september', '12'],
    answer: `Unlimited Fun opens on 12 September 2026 at ${SITE.openingTime}. We can't wait to see you there!`,
  },
  {
    keywords: ['location', 'where', 'address', 'ekkada', 'location ekkada', 'map', 'direction', 'reach', 'place', 'located'],
    answer: `Unlimited Fun is located in ${SITE.city}, ${SITE.region}. You can get directions using the Google Maps link on our Contact section.`,
  },
  {
    keywords: ['game', 'activity', 'activities', 'play', 'trampoline', 'climb', 'adventure', '13 games', 'games enti', 'games list', 'what can i do'],
    answer: `We have ${SITE.activityCount} exciting activities including:\n\n1. Indoor Climbing Wall\n2. Main Trampoline Court\n3. Trampoline Basketball\n4. Sweeper\n5. Hanging Tire Bridge\n6. Ninja Warrior Rings\n7. Foam Obstacles & Cylindrical Blocks\n8. Triangle & Rectangle Foam Bridges\n9. Jumping Balloons\n\nMore activities coming soon! Visit the Games section for details.`,
  },
  {
    keywords: ['book', 'booking', 'slot', 'reserve', 'ticket book', 'booking ela', 'how to book', 'appointment', 'book chesi'],
    answer: `You can book your slot by filling out the booking form on this website. Click "Book Your Slot" in the navigation or scroll to the booking section. Enter your details and our team will contact you to confirm your slot.`,
  },
  {
    keywords: ['birthday', 'party', 'celebration', 'event', 'group', 'celebrate', 'birthday party'],
    answer: `Yes! Unlimited Fun can be positioned for birthday celebrations and group experiences. Use the "Enquire Now" button in the Birthday Parties section to submit your enquiry and our team will contact you.`,
  },
  {
    keywords: ['safety', 'rule', 'safe', 'weight', 'limit', 'kg', 'heavy', 'restrict', 'age', 'old', 'young', 'tevaru'],
    answer: `Safety first! Please follow staff instructions, use required safety equipment, follow all park guidelines, and respect other visitors. Participants must be below ${SITE.weightLimit}. Rules may vary by activity.`,
  },
  {
    keywords: ['offer', 'discount', 'deal', 'save', 'instagram offer', '50%', 'second attempt', 'second visit', '15%', '10%', 'promo', 'coupon'],
    answer: `Here are our exclusive Instagram offers:\n\n1. FOLLOW + PRE-BOOK = 15% OFF\n2. SECOND VISIT = 50% OFF (Major Promo!)\n3. FOLLOWERS GET 10% OFF on every visit\n\nFollow us @unlimited_fun_is_here to claim! Note: Terms apply and offers cannot be stacked unless specified.`,
  },
  {
    keywords: ['contact', 'phone', 'call', 'number', 'email', 'whatsapp', 'reach you', 'talk', 'dorakadaniki', 'number entha'],
    answer: `You can reach us at:\n\nPhone: ${SITE.phone}\nWhatsApp: ${SITE.whatsapp}\nEmail: ${SITE.email}\nHours: ${SITE.hours} (${SITE.workingDays})`,
  },
  {
    keywords: ['child', 'children', 'kid', 'kids', 'bidda', 'pilla', 'soft play', 'under 5'],
    answer: `Yes! We have a dedicated Soft Play zone for kids below 5 years (or under 2.5 ft): 30 Mins — ₹200, 1 Hour — ₹350, 2 Hours — ₹600, 3 Hours — ₹800.`,
  },
  {
    keywords: ['adult', 'adults', 'mature', 'trampoline park', '5 years', 'big kids'],
    answer: `Yes! For visitors 5 years and above (or over 2.5 ft), our Trampoline Park pricing is: 30 Mins — ₹300, 1 Hour — ₹500, 2 Hours — ₹850 (Best Value), 3 Hours — ₹1,100. Participants must be below ${SITE.weightLimit}.`,
  },
  {
    keywords: ['hello', 'hi', 'hey', 'namaste', 'namaskaram', 'good morning', 'good evening', 'vandanam'],
    answer: GREETING,
  },
];

function findAnswer(input: string): string {
  const text = input.toLowerCase().trim();
  if (!text) return FALLBACK;

  let bestMatch: Rule | null = null;
  let bestScore = 0;

  for (const rule of RULES) {
    for (const kw of rule.keywords) {
      if (text.includes(kw.toLowerCase())) {
        const score = kw.length;
        if (score > bestScore) {
          bestScore = score;
          bestMatch = rule;
        }
      }
    }
  }

  return bestMatch ? bestMatch.answer : FALLBACK;
}

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', text: GREETING },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typing]);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    setMessages((prev) => [...prev, { role: 'user', text }]);
    setInput('');
    setTyping(true);

    setTimeout(() => {
      const answer = findAnswer(text);
      setMessages((prev) => [...prev, { role: 'bot', text: answer }]);
      setTyping(false);
    }, 600);
  };

  const quickQuestions = [
    'Price entha?',
    'Timings enti?',
    '13 games enti?',
    'Booking ela cheyyali?',
    'Location ekkada?',
  ];

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 inline-flex items-center gap-2 rounded-full bg-volt-500 px-5 py-3.5 text-sm font-bold text-ink-950 shadow-xl shadow-volt-500/30 hover:bg-volt-400 transition-all hover:scale-105 active:scale-95"
          aria-label="Open chat"
        >
          <MessageCircle className="h-5 w-5" />
          <span className="hidden sm:inline">Ask Us</span>
        </button>
      )}

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-96 max-h-[600px] rounded-2xl bg-ink-900 border border-ink-700 shadow-2xl flex flex-col animate-scale-in overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between bg-ink-800 px-4 py-3 border-b border-ink-700">
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-volt-500/20">
                <MessageCircle className="h-5 w-5 text-volt-500" />
              </div>
              <div>
                <p className="font-bold text-white text-sm">Unlimited Fun Assistant</p>
                <p className="text-xs text-green-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-400" />
                  Online
                </p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-ink-400 hover:text-white transition-colors"
              aria-label="Close chat"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[280px] max-h-[400px]">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-line ${
                    msg.role === 'user'
                      ? 'bg-volt-500 text-ink-950 rounded-br-sm'
                      : 'bg-ink-800 text-ink-100 rounded-bl-sm'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex justify-start">
                <div className="bg-ink-800 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-ink-500 animate-pulse" />
                  <span className="w-2 h-2 rounded-full bg-ink-500 animate-pulse" style={{ animationDelay: '0.2s' }} />
                  <span className="w-2 h-2 rounded-full bg-ink-500 animate-pulse" style={{ animationDelay: '0.4s' }} />
                </div>
              </div>
            )}
          </div>

          {/* Quick questions */}
          {messages.length <= 1 && (
            <div className="px-4 pb-2 flex flex-wrap gap-2">
              {quickQuestions.map((q) => (
                <button
                  key={q}
                  onClick={() => {
                    setInput(q);
                    setTimeout(() => {
                      setMessages((prev) => [...prev, { role: 'user', text: q }]);
                      setTyping(true);
                      setTimeout(() => {
                        setMessages((prev) => [...prev, { role: 'bot', text: findAnswer(q) }]);
                        setTyping(false);
                      }, 600);
                    }, 50);
                    setInput('');
                  }}
                  className="text-xs font-medium rounded-full bg-ink-800 border border-ink-700 px-3 py-1.5 text-ink-300 hover:border-volt-500/40 hover:text-volt-500 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-3 border-t border-ink-700 bg-ink-900">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') send();
                }}
                placeholder="Type your question..."
                className="flex-1 rounded-full bg-ink-800 border border-ink-700 px-4 py-2.5 text-sm text-white placeholder-ink-500 focus:border-volt-500 focus:outline-none"
              />
              <button
                onClick={send}
                className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-volt-500 text-ink-950 hover:bg-volt-400 transition-colors flex-shrink-0"
                aria-label="Send"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
