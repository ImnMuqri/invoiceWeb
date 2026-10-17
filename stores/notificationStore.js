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
      /* quiet: this runs on a 30-second timer in the background. Counting it
         would leave the page progress bar blinking on forever. */
      const res = await $api.get("/notifications", { quiet: true });
      notifications.value = res.data;

      const countRes = await $api.get("/notifications/unread-count", { quiet: true });
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

  const remove = async (id) => {
    /* Optimistic, with the row kept aside so a failure can put it back where it
       was rather than dropping it and telling the user nothing happened. */
    const i = notifications.value.findIndex((n) => n.id === id);
    if (i === -1) return;
    const [gone] = notifications.value.splice(i, 1);
    if (!gone.isRead) unreadCount.value = Math.max(0, unreadCount.value - 1);
    try {
      await $api.delete(`/notifications/${id}`);
    } catch (error) {
      notifications.value.splice(i, 0, gone);
      if (!gone.isRead) unreadCount.value += 1;
      throw error;
    }
  };

  /** scope: "read" clears what has been read; "all" clears everything. */
  const clear = async (scope = "read") => {
    const before = notifications.value.slice();
    const beforeCount = unreadCount.value;
    notifications.value =
      scope === "all" ? [] : notifications.value.filter((n) => !n.isRead);
    if (scope === "all") unreadCount.value = 0;
    try {
      const res = await $api.delete("/notifications", { params: { scope } });
      return res.data;
    } catch (error) {
      notifications.value = before;
      unreadCount.value = beforeCount;
      throw error;
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
    remove,
    clear,
    startPolling,
    stopPolling,
  };
});
