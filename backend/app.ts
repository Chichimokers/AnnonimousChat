import { WebSocket, WebSocketServer } from 'ws';
interface Client {
  socket: WebSocket;
  username?: string | null;
  ip?:string| null;
  partner?: Client; // mejor referenciar al objeto Client completo
}

const wss = new WebSocketServer({ port: 3001 });

const waitingQueue: Client[] = [];

wss.on('connection', (socket: WebSocket) => {
  const ip = (socket as any)._socket.remoteAddress as string;
  const client: Client = { socket, ip };

  // Intentar emparejar
  if (waitingQueue.length > 0) {
    const partner = waitingQueue.shift()!;
    client.partner = partner;
    partner.partner = client;

    client.socket.send(JSON.stringify({ type: 'paired',  paired:partner.username }));

    partner.socket.send(JSON.stringify({ type: 'paired', paired:client.username }));

  } else {
    waitingQueue.push(client);
    client.socket.send(JSON.stringify({ type: 'waiting' }));
  }

  socket.on('message', (message: string | Buffer | ArrayBuffer | Buffer[]) => {
    console.log(JSON.parse(message.toString()));
    const mensajejson = JSON.parse(message.toString());
    
    if (mensajejson.type === "username") {
      // Obtener la IP real del socket
      const ip = (socket as any)._socket.remoteAddress as string;
    
      waitingQueue.forEach((client) => {
        if (client.ip === ip) {
          console.log('IP encontrada:', client.ip);
    
          // Asignar username correctamente (usar = para asignar)
          client.username = mensajejson.username;
    
          console.log('Username asignado:', client.username);
        }
      });
    }

    // Reenviar mensaje al partner si está conectado y abierto
    if (client.partner && client.partner.socket.readyState === WebSocket.OPEN) {
      // message puede ser Buffer, string o ArrayBuffer, aquí lo enviamos tal cual
      client.partner.socket.send(message);
    }
  });

  socket.on('close', () => {
    // Si estaba en espera, removerlo
    const index = waitingQueue.findIndex(c => c.socket === socket);
    if (index !== -1) {
      waitingQueue.splice(index, 1);
    }

    // Notificar y desconectar partner si existía
    if (client.partner && client.partner.socket.readyState === WebSocket.OPEN) {
      client.partner.socket.send(JSON.stringify({ type: 'partner-disconnected' }));
      client.partner.socket.close();
    }
  });
});
