import { useState, useEffect } from 'react';

const LS_KEY = 'hq_reminder';

// Module-level ref so it survives re-renders
let timeoutRef: ReturnType<typeof setTimeout> | null = null;

function msUntilNext(hour: number, minute: number): number {
  const now = new Date();
  const target = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    hour,
    minute,
    0,
    0,
  );
  if (target.getTime() <= now.getTime()) {
    // Already passed today — schedule for tomorrow
    target.setDate(target.getDate() + 1);
  }
  return target.getTime() - now.getTime();
}

function fireNotification() {
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;
  new Notification('HabitQuest ⚡', {
    body: 'Time to complete your daily quests!',
    icon: '/favicon.svg',
    tag: 'hq-daily',
  });
}

export interface ReminderTime {
  hour: number;
  minute: number;
}

export interface UseNotificationsReturn {
  permission: NotificationPermission;
  requestPermission: () => Promise<void>;
  scheduleReminder: (hour: number, minute: number) => void;
  cancelReminder: () => void;
  isScheduled: boolean;
  reminderTime: ReminderTime | null;
}

export function useNotifications(): UseNotificationsReturn {
  const [permission, setPermission] = useState<NotificationPermission>(
    'Notification' in window ? Notification.permission : 'denied',
  );
  const [isScheduled, setIsScheduled] = useState<boolean>(
    localStorage.getItem(LS_KEY) !== null,
  );
  const [reminderTime, setReminderTime] = useState<ReminderTime | null>(() => {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as ReminderTime;
    } catch {
      return null;
    }
  });

  const scheduleReminder = (hour: number, minute: number) => {
    if (!('Notification' in window)) return;

    // Clear any existing timeout
    if (timeoutRef !== null) {
      clearTimeout(timeoutRef);
      timeoutRef = null;
    }

    const data: ReminderTime = { hour, minute };
    localStorage.setItem(LS_KEY, JSON.stringify(data));
    setIsScheduled(true);
    setReminderTime(data);

    const schedule = () => {
      const delay = msUntilNext(hour, minute);
      timeoutRef = setTimeout(() => {
        fireNotification();
        // Reschedule 24 hours later
        timeoutRef = setTimeout(schedule, 24 * 60 * 60 * 1000);
      }, delay);
    };

    schedule();
  };

  const cancelReminder = () => {
    if (timeoutRef !== null) {
      clearTimeout(timeoutRef);
      timeoutRef = null;
    }
    localStorage.removeItem(LS_KEY);
    setIsScheduled(false);
    setReminderTime(null);
  };

  const requestPermission = async () => {
    if (!('Notification' in window)) return;
    const result = await Notification.requestPermission();
    setPermission(result);
  };

  // On mount: restore scheduled reminder if permission was already granted
  useEffect(() => {
    if (!('Notification' in window)) return;
    const currentPermission = Notification.permission;
    setPermission(currentPermission);

    if (currentPermission === 'granted') {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        try {
          const stored = JSON.parse(raw) as ReminderTime;
          scheduleReminder(stored.hour, stored.minute);
        } catch {
          localStorage.removeItem(LS_KEY);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    permission,
    requestPermission,
    scheduleReminder,
    cancelReminder,
    isScheduled,
    reminderTime,
  };
}
