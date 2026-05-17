import React, { useEffect, useRef } from 'react';
import MessageItem from './MessageItem';

export default function MessageList({ messages, currentUser }) {
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col">
      {messages.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-gray-400">
          Chưa có tin nhắn nào. Hãy là người bắt đầu!
        </div>
      ) : (
        messages.map((msg, idx) => (
          <MessageItem 
            key={msg.id || idx} 
            message={msg} 
            isMine={currentUser?.id === msg.senderId} 
          />
        ))
      )}
      <div ref={endRef} />
    </div>
  );
}
