/**
 * Open WhatsApp with the message already written.
 *
 * The sender's own WhatsApp does the sending — this only composes. That is the
 * whole point of it while Twilio is unsettled: no allowance is spent, no plan
 * gate applies, and it works for a business that has not connected anything.
 *
 * The text comes from the server rather than being built here, and it has to:
 * the template lives in the sender's settings row, amounts are stored in sen and
 * must go through the one formatter, and a quotation's link needs its public
 * token minted. Rebuilding any of that client-side is how the "50,000 instead of
 * RM500" class of bug gets reintroduced.
 *
 * POPUP BLOCKERS are the whole reason this is a composable and not four lines
 * inline. Browsers only allow window.open() during the turn of a real click; by
 * the time an awaited fetch resolves, that permission is gone and the call is
 * silently swallowed. So the tab is opened EMPTY and synchronously, before any
 * awaiting, and pointed at the URL once the text arrives. If the browser refused
 * even that, `blocked` comes back true and the caller can offer the wording to
 * copy instead of leaving the user staring at a button that did nothing.
 */
import { ref } from "vue";

/**
 * Is this a phone or tablet, where the WhatsApp APP should take over?
 *
 * Decides which of the two links the server hands back gets used:
 *
 *   desktop → web.whatsapp.com/send, which opens WhatsApp Web on the
 *             conversation directly. wa.me on a desktop stops at a "Continue to
 *             Chat" interstitial first, and this feature is for somebody at a
 *             laptop with WhatsApp Web already open.
 *   mobile  → wa.me, which hands off to the installed app. Sending a phone to
 *             web.whatsapp.com gets them a page asking them to scan a QR code
 *             with the phone they are already holding.
 *
 * A user-agent test, which is a guess — but the failure mode either way is one
 * extra tap, not a lost message, and both links carry the same text. Checked at
 * call time rather than at module load so it is never captured during SSR, where
 * there is no navigator at all.
 */
function onMobileDevice() {
  if (typeof navigator === "undefined") return false;
  return /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|Mobile Safari/i.test(
    navigator.userAgent || "",
  );
}

export function useWhatsappShare() {
  const { $api } = useNuxtApp();

  const sharing = ref(false);
  /** Last composed message, so a caller can show or copy it after a block. */
  const lastText = ref("");

  /**
   * @param {"invoice"|"quote"} kind
   * @param {number|string} id
   * @returns {Promise<{ok: boolean, blocked?: boolean, text?: string, hasPhone?: boolean, error?: string}>}
   */
  const share = async (kind, id) => {
    sharing.value = true;

    /* Claim the tab NOW, while the click is still live. about:blank rather than
       the final url because we do not know the url yet. */
    const tab = window.open("", "_blank");

    try {
      const { data } = await $api.get(`/whatsapp/share/${kind}/${id}`);
      lastText.value = data?.text || "";

      /* webUrl on a desktop, url on a phone. Falls back to whichever exists, so
         an older response shape still opens something. */
      const target = onMobileDevice()
        ? data?.url || data?.webUrl
        : data?.webUrl || data?.url;

      if (!target) throw new Error("No share link came back.");

      if (tab && !tab.closed) {
        tab.location.href = target;
        return { ok: true, text: data.text, hasPhone: data.hasPhone };
      }

      /* Blocked, or the user closed it while we were composing. Not an error —
         we still have the wording, which is the part that took work. */
      return {
        ok: false,
        blocked: true,
        text: data.text,
        hasPhone: data.hasPhone,
      };
    } catch (err) {
      /* A tab left sitting on about:blank looks like a crash. Close it. */
      if (tab && !tab.closed) tab.close();
      return {
        ok: false,
        error:
          err.response?.data?.message ||
          err.message ||
          "Could not put that message together. Try again in a moment.",
      };
    } finally {
      sharing.value = false;
    }
  };

  return { share, sharing, lastText };
}
