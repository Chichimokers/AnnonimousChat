'use client';


import { useState } from 'react';
import MessageBubble from './MessageBubble';
import { useChat } from '../context/ChatContext';
import { stat } from 'fs';

export default function ChatWindow() {
  const { userName, messages, sendMessage ,status ,pair } = useChat();
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim()) {
      sendMessage(input.trim());
      setInput('');
    }
  };

  return (// Dentro de ChatWindow.tsx
  <div style={{
    height: '100vh',
    background: '#0f172a',
    color: '#f1f5f9',
    display: 'flex',
    flexDirection: 'column',
    padding: '1rem',
  }}>
    <h1 style={{ textAlign: 'center', fontSize: '1.5rem' }}>
      💬 Bienvenido {userName}
      {status == "waiting" ? (
      <p>Esperando por pareja</p>
     ):(
      <h1>Tu pareja es {pair}</h1>
       )}
    </h1>

    <div style={{
      flex: 1,
      overflowY: 'auto',
      padding: '1rem',
      marginTop: '1rem',
      background: '#1e293b',
      borderRadius: '12px',
    }}>
      {messages.map((msg, i) => (
        <MessageBubble
          key={i}
          sender={msg.sender}
          text={msg.text}
          isMine={msg.sender === userName}
        />
      ))}
    </div>
  
    <div style={{ display: 'flex', marginTop: '1rem' }}>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        style={{
          flex: 1,
          padding: '0.75rem',
          borderRadius: '12px 0 0 12px',
          border: 'none',
          outline: 'none',
          background: '#1e293b',
          color: '#f1f5f9',
          fontSize: '1rem',
        }}
        placeholder="Escribe algo..."
      />
      <button
        onClick={handleSend}
        style={{
          background: '#2563eb',
          color: 'white',
          padding: '0 1.5rem',
          borderRadius: '0 12px 12px 0',
          border: 'none',
          fontSize: '1rem',
        }}
      >
        Enviar
      </button>
    </div>
  </div>
)  
}
