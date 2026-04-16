import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { useNuxtApp } from "#app";

export const useNotificationStore = defineStore("notifications", () => {
  const { $api } = useNuxtApp();

  const notifications = ref([]);
  const unreadCount = ref(0);
  const loading = ref(false);

  const fetchNotifications = async () => {
    loading.value = true;
    try {
      const res = await $api.get("/notifications");
      notifications.value = res.data;
      
      const countRes = await $api.get("/notifications/unread-count");
      unreadCount.value = countRes.data.count;
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      loading.value = false;
    }
  };

  const markAsRead = async (id) => {
    try {
      await $api.put(`/notifications/${id}/read`);
      const notif = notifications.value.find((n) => n.id === id);
      if (notif && !notif.isRead) {
        notif.isRead = true;
        unreadCount.value = Math.max(0, unreadCount.value - 1);
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await $api.put("/notifications/read-all");
      notifications.value.forEach((n) => {
        n.isRead = true;
      });
      unreadCount.value = 0;
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  // Poll notifications every 30 seconds
  let interval = null;
  const startPolling = () => {
    if (interval) return;
    fetchNotifications();
    interval = setInterval(fetchNotifications, 30000);
  };

  const stopPolling = () => {
    if (interval) {
      clearInterval(interval);
      interval = null;
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    startPolling,
    stopPolling,
  };
});
