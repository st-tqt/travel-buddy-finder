import React from 'react';

export default function EmptyState({ icon, title, message, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-12 bg-white rounded-2xl border border-dashed border-gray-200 shadow-sm max-w-xl mx-auto my-8">
      {icon && <div className="text-5xl mb-4 select-none animate-bounce">{icon}</div>}
      {title && <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>}
      {message && <p className="text-gray-500 text-sm max-w-sm mb-6 leading-relaxed">{message}</p>}
      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
