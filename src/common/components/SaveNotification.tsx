import React from 'react';

interface SaveNotificationProps {
  show: boolean;
  message: string;
}

export const SaveNotification: React.FC<SaveNotificationProps> = ({ show, message }) => {
  if (!show) return null;

  return (
    <div className="fixed bottom-5 right-5 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg transition-opacity duration-300 animate-fade-in-out">
      {message}
    </div>
  );
};