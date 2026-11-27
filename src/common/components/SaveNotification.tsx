interface SaveNotificationProps {
  show: boolean;
  message: string;
}

export const SaveNotification = ({ show, message }: SaveNotificationProps) => (
  <div
    role="status"
    className={`fixed bottom-5 right-5 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg transition-opacity duration-300 ${show ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
  >
    {message}
  </div>
);
