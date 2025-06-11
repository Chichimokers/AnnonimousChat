export default function MessageBubble({
    sender,
    text,
    isMine,
  }: {
    sender: string;
    text: string;
    isMine: boolean;
  }) {
    return (
      <div style={{
        textAlign: isMine ? 'right' : 'left',
        marginBottom: '8px',
      }}>
        <div
          style={{
            display: 'inline-block',
            background: isMine ? '#2563eb' : '#334155',
            color: 'white',
            padding: '10px 15px',
            borderRadius: '20px',
            maxWidth: '60%',
            wordWrap: 'break-word',
          }}
        >
          <div style={{ fontSize: '0.75rem', opacity: 0.7, marginBottom: 2 }}>
            {isMine ? 'Tú' : sender}
          </div>
          <div>{text}</div>
        </div>
      </div>
    );
  }
  