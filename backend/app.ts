import { WebSocket, WebSocketServer } from 'ws';

interface Client {
  socket: WebSocket;
  username?: string | null;
  ip?: string | null;
  partner?: Client;
}

const wss = new WebSocketServer({ port: 3001 });
const waitingQueue: Client[] = [];

wss.on('connection', (socket: WebSocket) => {
  const ip = (socket as any)._socket?.remoteAddress ?? null;
  const client: Client = { socket, ip };

  // Mensajes entrantes
  socket.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      console.log('Mensaje recibido:', data);

      // Cuando el cliente envía su username
      if (data.type === "username") {
        client.username = data.username;
        console.log(`Username asignado: ${client.username}`);

        // Ahora sí: intentamos emparejar
        if (waitingQueue.length > 0) {
          const partner = waitingQueue.shift()!;
          client.partner = partner;
          partner.partner = client;

          // Enviar nombre de la pareja a ambos
          client.socket.send(JSON.stringify({ type: 'paired', paired: partner.username }));
          partner.socket.send(JSON.stringify({ type: 'paired', paired: client.username }));
        } else {
          // No hay pareja, se agrega a la cola
          waitingQueue.push(client);
          client.socket.send(JSON.stringify({ type: 'waiting' }));
        }
        return; // Ya manejamos este mensaje
      }

      // Si tiene pareja, reenviar mensajes
      if (client.partner && client.partner.socket.readyState === WebSocket.OPEN) {
        client.partner.socket.send(message);
        console.log('mensje enviado',message)
      }

    } catch (err) {
      console.error('Error al parsear mensaje:', err);
    }
  });

  socket.on('close', () => {
    // Quitar de la cola si estaba esperando
    const index = waitingQueue.findIndex(c => c.socket === socket);
    if (index !== -1) {
      waitingQueue.splice(index, 1);
    }

    // Notificar a la pareja y cerrarle
    if (client.partner && client.partner.socket.readyState === WebSocket.OPEN) {
      client.partner.socket.send(JSON.stringify({ type: 'partner-disconnected' }));
      client.partner.socket.close();
    }
  });
});
