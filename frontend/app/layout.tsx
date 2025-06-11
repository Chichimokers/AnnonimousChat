import { ChatProvider } from './context/ChatContext';
import './globals.css';


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <ChatProvider>
          {children}
        </ChatProvider>
      </body>
    </html>
  );
}
