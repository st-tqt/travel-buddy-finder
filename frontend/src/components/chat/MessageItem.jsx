import React from 'react';

export default function MessageItem({ message, isMine }) {
  if (message.type === 'system') {
    return (
      <div className="flex justify-center my-2">
        <span className="bg-gray-200 text-gray-600 text-xs py-1 px-3 rounded-full">
          {message.content}
        </span>
      </div>
    );
  }

  return (
    <div className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} mb-4`}>
      <div className="text-xs text-gray-500 mb-1 mx-1">
        {isMine ? 'Bạn' : message.userEmail || message.senderId} • {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </div>
      <div className={`max-w-[75%] px-4 py-2 rounded-2xl ${isMine ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-100 text-gray-800 rounded-bl-none'}`}>
        <p className="whitespace-pre-wrap break-words text-sm">{message.content}</p>
      </div>
    </div>
  );
}
