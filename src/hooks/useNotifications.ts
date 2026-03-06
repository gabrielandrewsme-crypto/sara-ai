import { useEffect, useRef, useCallback, useState } from 'react';
import { useSara } from '@/contexts/SaraContext';

export type NotificationPermissionState = 'default' | 'granted' | 'denied' | 'unsupported';

export const useNotifications = () => {
  const { routineItems, reminders, events, user } = useSara();
  const notifiedRef = useRef<Set<string>>(new Set());
  const [permission, setPermission] = useState<NotificationPermissionState>(() => {
    if (typeof Notification === 'undefined') return 'unsupported';
    return Notification.permission as NotificationPermissionState;
  });

  const requestPermission = useCallback(async () => {
    if (typeof Notification === 'undefined') {
      setPermission('unsupported');
      return 'unsupported' as NotificationPermissionState;
    }
    const result = await Notification.requestPermission();
    setPermission(result as NotificationPermissionState);
    return result as NotificationPermissionState;
  }, []);

  const sendNotification = useCallback((title: string, body: string) => {
    if (permission !== 'granted') return;
    try {
      new Notification(title, {
        body,
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag: title, // prevents duplicate notifications
      });
    } catch {
      // SW notification fallback
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then((reg) => {
          reg.showNotification(title, {
            body,
            icon: '/icon-192.png',
            badge: '/icon-192.png',
            tag: title,
          });
        });
      }
    }
  }, [permission]);

  // Check routine items every minute
  useEffect(() => {
    if (permission !== 'granted' || !user.notifications.tasks) return;

    const checkRoutine = () => {
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      routineItems.forEach((item) => {
        const notifKey = `routine-${item.id}-${today}-${item.time}`;
        const isCompletedToday = item.lastCompletedDate === today;

        if (!isCompletedToday && item.time === currentTime && !notifiedRef.current.has(notifKey)) {
          notifiedRef.current.add(notifKey);
          sendNotification('⏰ Rotina - Sara', `Hora de: ${item.title}`);
        }

        // Also notify 5 min before
        const [h, m] = item.time.split(':').map(Number);
        const fiveMinBefore = new Date(now);
        fiveMinBefore.setHours(h, m - 5, 0, 0);
        const beforeTime = `${String(fiveMinBefore.getHours()).padStart(2, '0')}:${String(fiveMinBefore.getMinutes()).padStart(2, '0')}`;
        const beforeKey = `routine-before-${item.id}-${today}`;

        if (!isCompletedToday && beforeTime === currentTime && !notifiedRef.current.has(beforeKey)) {
          notifiedRef.current.add(beforeKey);
          sendNotification('🔔 Em 5 minutos - Sara', `${item.title} às ${item.time}`);
        }
      });
    };

    checkRoutine();
    const interval = setInterval(checkRoutine, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, [permission, routineItems, user.notifications.tasks, sendNotification]);

  // Check reminders
  useEffect(() => {
    if (permission !== 'granted' || !user.notifications.tasks) return;

    const checkReminders = () => {
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      reminders.forEach((reminder) => {
        if (reminder.completed || !reminder.time) return;
        // If reminder has a date, only check on that date
        if (reminder.date && reminder.date !== today) return;
        // If no date, check every day
        const dayKey = reminder.date || today;

        const notifKey = `reminder-${reminder.id}-${dayKey}`;
        if (reminder.time === currentTime && !notifiedRef.current.has(notifKey)) {
          notifiedRef.current.add(notifKey);
          sendNotification('🔔 Lembrete - Sara', reminder.title);
        }

        // 5 min before
        const [h, m] = reminder.time.split(':').map(Number);
        const fiveBefore = new Date(now);
        fiveBefore.setHours(h, m - 5, 0, 0);
        const beforeTime = `${String(fiveBefore.getHours()).padStart(2, '0')}:${String(fiveBefore.getMinutes()).padStart(2, '0')}`;
        const beforeKey = `reminder-before-${reminder.id}-${dayKey}`;

        if (beforeTime === currentTime && !notifiedRef.current.has(beforeKey)) {
          notifiedRef.current.add(beforeKey);
          sendNotification('🔔 Em 5 minutos - Sara', reminder.title);
        }
      });
    };

    checkReminders();
    const interval = setInterval(checkReminders, 30000);
    return () => clearInterval(interval);
  }, [permission, reminders, user.notifications.tasks, sendNotification]);

  // Check events
  useEffect(() => {
    if (permission !== 'granted' || !user.notifications.events) return;

    const checkEvents = () => {
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      events.forEach((event) => {
        if (event.date !== today) return;

        const notifKey = `event-${event.id}-${today}`;
        if (event.startTime === currentTime && !notifiedRef.current.has(notifKey)) {
          notifiedRef.current.add(notifKey);
          sendNotification('📅 Agenda - Sara', `Agora: ${event.title}${event.location ? ` em ${event.location}` : ''}`);
        }

        // 10 min before
        const [h, m] = event.startTime.split(':').map(Number);
        const tenBefore = new Date(now);
        tenBefore.setHours(h, m - 10, 0, 0);
        const beforeTime = `${String(tenBefore.getHours()).padStart(2, '0')}:${String(tenBefore.getMinutes()).padStart(2, '0')}`;
        const beforeKey = `event-before-${event.id}-${today}`;

        if (beforeTime === currentTime && !notifiedRef.current.has(beforeKey)) {
          notifiedRef.current.add(beforeKey);
          sendNotification('📅 Em 10 minutos - Sara', `${event.title}${event.location ? ` em ${event.location}` : ''}`);
        }
      });
    };

    checkEvents();
    const interval = setInterval(checkEvents, 30000);
    return () => clearInterval(interval);
  }, [permission, events, user.notifications.events, sendNotification]);

  // Clear old notification keys daily
  useEffect(() => {
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    const msUntilMidnight = midnight.getTime() - Date.now();

    const timeout = setTimeout(() => {
      notifiedRef.current.clear();
    }, msUntilMidnight);

    return () => clearTimeout(timeout);
  }, []);

  return {
    permission,
    requestPermission,
    sendNotification,
    isSupported: typeof Notification !== 'undefined',
  };
};
