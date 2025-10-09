import { useEffect, useState } from "react";
import { MessageSquare, X } from "lucide-react";

type Msg = { id: string; from: "user" | "bot"; text: string; ts: string };

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem("chatMessages") : null;
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("chatMessages", JSON.stringify(messages));
    } catch {}
  }, [messages]);

  function push(msg: Msg) {
    setMessages((m) => [...m, msg]);
  }

  function handleSend() {
    if (!input.trim()) return;
    const userMsg: Msg = { id: String(Date.now()), from: "user", text: input.trim(), ts: new Date().toISOString() };
    push(userMsg);
    setInput("");

    // mock bot reply (simple heuristics)
    setTimeout(() => {
      const lower = input.toLowerCase();
      if (lower.includes("chest")) {
        const botMsg: Msg = { id: String(Date.now() + 1), from: "bot", text: "If you're experiencing chest pain, please go to the ER immediately or call emergency services.", ts: new Date().toISOString() };
        push(botMsg);
        return;
      }

      // offer to start triage
      const botMsg: Msg = { id: String(Date.now() + 1), from: "bot", text: "I can start a quick symptom assessment for you. Reply 'start' to begin or type '/save-triage <summary>' to save a triage from chat.", ts: new Date().toISOString() };
      push(botMsg);
    }, 700);
  }

  // allow user to trigger triage or save triage via special commands
  useEffect(() => {
    if (!messages.length) return;
    const last = messages[messages.length - 1];
    if (last.from !== 'user') return;
    const t = last.text.trim().toLowerCase();
    if (t === 'start') {
      // open triage UI by dispatching an event
      try { window.dispatchEvent(new CustomEvent('chat:start-triage')) } catch {}
    }
    if (t.startsWith('/save-triage')) {
      const rest = last.text.replace('/save-triage', '').trim();
      if (rest.length) {
        const entry = { id: String(Date.now()), timestamp: new Date().toISOString(), summary: rest.slice(0,140), result: 'Clinic' as const, confidence: 70, raw: { via: 'chat' } };
        try { window.dispatchEvent(new CustomEvent('triage:created', { detail: entry })) } catch {}
        // also persist to localStorage directly
        try { const cur = localStorage.getItem('triageHistory'); const arr = cur ? JSON.parse(cur) : []; arr.unshift(entry); localStorage.setItem('triageHistory', JSON.stringify(arr.slice(0,50))); } catch {}
        const botMsg: Msg = { id: String(Date.now() + 2), from: 'bot', text: 'Saved triage from chat. Check your Triage History.', ts: new Date().toISOString() };
        push(botMsg);
      }
    }
  }, [messages]);

  return (
    <div>
      {/* Floating button */}
      <div className="fixed bottom-24 right-6 z-50">
        {!open && (
          <button onClick={() => setOpen(true)} className="w-14 h-14 rounded-full bg-primary shadow-lg flex items-center justify-center text-white">
            <MessageSquare className="w-6 h-6" />
          </button>
        )}

        {open && (
          <div className="w-80 h-96 bg-card border rounded-lg shadow-xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 border-b">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                <div className="font-medium">AI Assistant</div>
              </div>
              <button onClick={() => setOpen(false)} className="p-1"><X className="w-4 h-4" /></button>
            </div>

            <div className="flex-1 p-3 overflow-auto space-y-2">
              {messages.length === 0 && <div className="text-sm text-muted-foreground">Hi — ask me about symptoms, bookings, or ER wait times.</div>}
              {messages.map((m) => (
                <div key={m.id} className={`max-w-full ${m.from === 'user' ? 'text-right' : 'text-left'}`}>
                  <div className={`inline-block px-3 py-2 rounded ${m.from === 'user' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-900'}`}>{m.text}</div>
                  <div className="text-xs text-muted-foreground mt-1">{new Date(m.ts).toLocaleTimeString()}</div>
                </div>
              ))}
            </div>

            <div className="p-2 border-t flex gap-2">
              <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} className="flex-1 px-2 py-1 border rounded" placeholder="Ask the AI..." />
              <button onClick={handleSend} className="px-3 py-1 rounded bg-primary text-white">Send</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
