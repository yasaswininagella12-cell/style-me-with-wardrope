import { useState } from 'react';
import { sendChat } from '../api';
import Reveal from './Reveal';

const SEED = [
  { from: 'ai', text: "Hey gorgeous! What's the occasion today? 💅" },
  {
    from: 'me',
    text: 'Wedding in 2 hours, black dress and gold heels — what accessories?'
  },
  {
    from: 'ai',
    text: "A satin clutch + delicate gold jewelry + a soft updo. Skip the necklace, let the heels shine. You're ready! ✨"
  }
];

export default function Chat() {
  const [messages, setMessages] = useState(SEED);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || typing) return;
    setMessages((m) => [...m, { from: 'me', text }]);
    setInput('');
    setTyping(true);
    try {
      const { reply } = await sendChat(text);
      setMessages((m) => [...m, { from: 'ai', text: reply }]);
    } catch {
      setMessages((m) => [
        ...m,
        { from: 'ai', text: 'Oops — my stylist brain is offline. Try again in a moment! 🛠️' }
      ]);
    } finally {
      setTyping(false);
    }
  };

  return (
    <section>
      <div className="wrap chat-wrap">
        <Reveal>
          <span className="kicker">
            <span className="dot" /> Instant answers
          </span>
          <h2
            style={{
              fontFamily: 'var(--font-head)',
              fontSize: 'clamp(30px, 4vw, 44px)',
              fontWeight: 600,
              marginBottom: 14
            }}
          >
            Your AI stylist is{' '}
            <em style={{ fontStyle: 'italic', color: 'var(--gold-light)' }}>always here</em>
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: 17, fontWeight: 300, maxWidth: 460 }}>
            Stuck on a tricky dress code or a big event? Ask any question about your style
            or clothes and get an instant, personal recommendation.
          </p>
        </Reveal>

        <Reveal className="chat-box">
          {messages.map((m, i) => (
            <div className={`bubble ${m.from}`} key={i}>
              {m.text}
            </div>
          ))}
          {typing && <div className="bubble ai typing" />}
          <div className="chat-input">
            <input
              type="text"
              placeholder="Ask your stylist anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button aria-label="Send" onClick={handleSend}>
              ➤
            </button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
