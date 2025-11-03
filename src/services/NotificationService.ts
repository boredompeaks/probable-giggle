import { getAnyRandomMessage } from '../utils/notificationMessages';

export class NotificationService {
  private static instance: NotificationService;
  private intervals: Map<string, NodeJS.Timeout> = new Map();

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Start random vague notifications
  startRandomNotifications(callback: (message: string) => void, intervalMs: number = 45000) {
    const key = 'random-notifications';
    
    // Clear existing interval
    this.stopNotifications(key);

    const interval = setInterval(() => {
      // 30% chance to show notification
      if (Math.random() < 0.3) {
        callback(getAnyRandomMessage());
      }
    }, intervalMs);

    this.intervals.set(key, interval);
  }

  // Stop notifications
  stopNotifications(key: string) {
    const interval = this.intervals.get(key);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(key);
    }
  }

  // One-time notification
  showVagueNotification(callback: (message: string) => void) {
    callback(getAnyRandomMessage());
  }

  // Clean up all intervals
  cleanup() {
    this.intervals.forEach((interval) => clearInterval(interval));
    this.intervals.clear();
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance();