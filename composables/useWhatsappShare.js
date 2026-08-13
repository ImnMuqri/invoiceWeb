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
 *
 * THE LINK IS wa.me/<the client's number>. It resolves to WhatsApp Web on a
 * desktop and to the app on a phone, and either way it lands on that client's
 * chat. An earlier version aimed desktops at web.whatsapp.com/send to skip
 * wa.me's "Continue to Chat" step; that saved a click and cost the whole point,
 * because it opened the sender's own WhatsApp Web without the client's
 * conversation. One documented entry point, one predictable landing.
 */
import { onMounted, ref } from "vue";

/**
 * A phone or tablet, where WhatsApp is an installed app rather than a website.
 *
 * This decides HOW the link is opened, not WHICH link — the url is wa.me on
 * every device. Choosing a different WhatsApp url per platform is the mistake
 * that opened the sender's own WhatsApp Web instead of the client's chat, and it
 * is not being repeated.
 */
function detectMobile() {
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

  /* Starts false and is only set after mount. The server has no user agent to
     read, so deciding this during render would make the markup disagree with the
     client's and Vue would report a hydration mismatch — on a label as small as
     "Web", which is not worth an error on every page load. */
  const isMobile = ref(false);
  onMounted(() => {
    isMobile.value = detectMobile();
  });

  /**
   * @param {"invoice"|"quote"} kind
   * @param {number|string} id
   * @returns {Promise<{ok: boolean, blocked?: boolean, noPhone?: boolean, phoneProblem?: "missing"|"unusable", text?: string, error?: string}>}
   */
  const share = async (kind, id) => {
    sharing.value = true;

    /* ON A PHONE, no second tab.
       wa.me is a universal link: navigating to it hands straight off to the
       installed WhatsApp app, and the browser stays where it was underneath, so
       coming back out of WhatsApp returns to this page. A pre-opened tab buys
       nothing there — it leaves a dead wa.me tab behind after the handoff, and
       iOS Safari is the least forgiving browser there is about a tab opened
       blank and pointed somewhere several hundred milliseconds later.

       A plain location assignment is never popup-blocked, so the mobile path
       cannot fail the way the desktop one can.

       ON A DESKTOP the tab is still claimed up front, because there the target
       really is a web page and taking over the current tab would throw away
       whatever the user had on screen. */
    const wantsTab = !detectMobile();
    const tab = wantsTab ? window.open("", "_blank") : null;

    try {
      const { data } = await $api.get(`/whatsapp/share/${kind}/${id}`);
      lastText.value = data?.text || "";

      /* No usable number — the server sends url: null rather than a link built
         on a guess. `phoneProblem` says which: "missing" (nothing saved) or
         "unusable" (something saved that WhatsApp cannot dial, almost always a
         local number like 016… stored without its country code). Different
         sentences, different fixes. Close the tab we claimed rather than parking
         it on a chat that does not exist. */
      if (!data?.url) {
        if (tab && !tab.closed) tab.close();
        return {
          ok: false,
          noPhone: true,
          phoneProblem: data?.phoneProblem || "missing",
          text: data?.text || "",
        };
      }

      /* wa.me/<client number> — lands on THAT CLIENT'S chat with the message
         typed, whether it resolves to WhatsApp Web or the phone app. */
      if (tab && !tab.closed) {
        tab.location.href = data.url;
        return { ok: true, text: data.text };
      }

      if (!wantsTab) {
        /* The mobile path. WhatsApp takes the foreground and this page is still
           behind it when they come back. */
        window.location.href = data.url;
        return { ok: true, text: data.text };
      }

      /* Desktop, and the tab was blocked or the user closed it while we were
         composing. Deliberately NOT falling back to navigating this tab: the
         panel this is clicked from sits on the invoice editor, and taking the
         page out from under someone to open a chat would be a poor trade. We
         still have the wording, which is the part that took work. */
      return {
        ok: false,
        blocked: true,
        text: data.text,
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

  return { share, sharing, lastText, isMobile };
}
