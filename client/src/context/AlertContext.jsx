import { createContext, useCallback, useState } from 'react';

export const AlertContext = createContext(null);

let nextId = 1;

export function AlertProvider({ children }) {
  const [alerts, setAlerts] = useState([]);

  const dismissAlert = useCallback((id) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  }, []);

  const showAlert = useCallback(
    (message, type = 'info', duration = 5000) => {
      const id = nextId++;
      setAlerts((prev) => [...prev, { id, message, type }]);
      if (duration) {
        setTimeout(() => dismissAlert(id), duration);
      }
    },
    [dismissAlert],
  );

  const value = {
    alerts,
    showAlert,
    dismissAlert,
    showSuccess: (message) => showAlert(message, 'success'),
    showError: (message) => showAlert(message, 'error'),
    showWarning: (message) => showAlert(message, 'warning'),
    showInfo: (message) => showAlert(message, 'info'),
  };

  return <AlertContext.Provider value={value}>{children}</AlertContext.Provider>;
}
