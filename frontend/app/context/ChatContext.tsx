'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

type ChatContextType = {
  userName: string;
  messages: { sender: string; text: string }[];
  sendMessage: (text: string) => void;
  status : string,
  pair: string
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const adjectives = ['Swift', 'Dark', 'Flying', 'Sneaky', 'Mighty', 'Electric'];
const animals = ['Panther', 'Tiger', 'Fox', 'Eagle', 'Shark', 'Wolf'];

function generateRandomName() {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const animal = animals[Math.floor(Math.random() * animals.length)];
  const number = Math.floor(1000 + Math.random() * 9000);
  return `${adj} ${animal} #${number}`;
}

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const [userName, setusername] = useState<string>('');
  const socketRef = useRef<WebSocket | null>(null);
  const [pair,setpair] = useState<string>('');
  const [status, setStatus] = useState<'waiting' | 'paired' | 'partnerDisconnected'>('waiting');
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([]);
  const [input, setInput] = useState('');
  const [isSocketOpen, setIsSocketOpen] = useState(false)
  useEffect(() => {
    const saved = localStorage.getItem('anon-name');
  
    if (saved) {
      setusername(saved);
    } else {
      const newName = generateRandomName();
      localStorage.setItem('anon-name', newName);
      setusername(newName);
    
    }

    const socket = new WebSocket('ws://167.99.238.54:3001');
    socketRef.current = socket;

    socket.onopen = () => {
      setIsSocketOpen(true)

    };

    socket.onmessage = async (event) => {
      let textData = '';
    
      if (event.data instanceof Blob) {
        // Convertir Blob a texto
        textData = await event.data.text();
      } else if (typeof event.data === 'string') {
        textData = event.data;
      } else {
        // Por si acaso viene otro tipo de dato
        textData = JSON.stringify(event.data);
      }
    
      try {
        const data = JSON.parse(textData);
    
        switch (data.type) {
          case 'waiting':
            setStatus('waiting');
            break;
          case 'paired':
            setStatus('paired');
            setpair(data.paired);
           
            break;
          case 'partner-disconnected':
            setStatus('partnerDisconnected');
            alert('Tu pareja se desconectó.');
            break;
          default:
            if (data.sender && data.text) {
              setMessages((msgs) => [...msgs, { sender: data.sender, text: data.text }]);
            }
        }
      } catch {
        // Si no es JSON, se asume texto plano
        setMessages((msgs) => [...msgs, { sender: 'Pareja', text: textData }]);
      }
    };
    

    socket.onclose = () => {
      alert('Conexión cerrada.');
      setStatus('waiting');
    };

 

    return () => {
      socket.close();
    };
  }, []);
  
  useEffect(() => {
    if (isSocketOpen && userName) {
      socketRef.current?.send(JSON.stringify({ type: 'username', username: userName }));
    }
  }, [isSocketOpen, userName]);

  const sendMessage = (text: string) => {

    if (status === 'paired' && text.trim().toString() !== '') {
      const messageObj = { sender: userName, text: text };
      socketRef.current?.send(JSON.stringify(messageObj));
      setMessages((msgs) => [...msgs, { sender: 'Yo', text: text }]);
      setInput('');
      
    }
  };

  return (
    <ChatContext.Provider value={{ userName, messages, sendMessage,status ,pair}}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChat must be used within a ChatProvider');
  return context;
};
