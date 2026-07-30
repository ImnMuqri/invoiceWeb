/**
 * Landing theme toggle.
 *
 * Writes data-theme on <html>, which design-tokens.css remaps semantic tokens
 * against. Deliberately independent of the authenticated app's `html.dark`
 * class so toggling here cannot leak into the dashboard's own theme state.
 *
 * Default is "system" — no attribute is set, and the prefers-color-scheme
 * block in the tokens file takes over.
 */

export type ThemeChoice = 'light' | 'dark' | 'system'

const STORAGE_KEY = 'kirim-theme'

/**
 * Runs synchronously in <head>, before first paint, so there is no flash.
 *
 * It RESOLVES the system preference into an explicit data-theme value rather
 * than leaving it unset. That is deliberate: it means CSS only ever has to
 * match [data-theme="dark"], so a component-level dark rule and a token remap
 * can never disagree. Leaving "system" unresolved previously meant OS-dark
 * users got the remapped tokens but not the component rules, which inverted
 * the ink slab to paper while its text stayed light.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var s=localStorage.getItem('${STORAGE_KEY}');var t=(s==='dark'||s==='light')?s:(window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.setAttribute('data-theme',t)}catch(e){document.documentElement.setAttribute('data-theme','light')}})();`

export function useTheme() {
  const choice = useState<ThemeChoice>('kirim-theme', () => 'system')

  const systemDark = ref(false)

  /* "system" is always resolved to an explicit value on <html> — never left
     unset — so CSS has exactly one dark-mode condition to match. */
  const apply = (value: ThemeChoice) => {
    if (typeof document === 'undefined') return
    const resolved = value === 'system' ? (systemDark.value ? 'dark' : 'light') : value
    document.documentElement.setAttribute('data-theme', resolved)
  }

  const isDark = computed(() =>
    choice.value === 'system' ? systemDark.value : choice.value === 'dark'
  )

  let mq: MediaQueryList | undefined
  const onSystemChange = (e: MediaQueryListEvent | MediaQueryList) => {
    systemDark.value = e.matches
    if (choice.value === 'system') apply('system')
  }

  onMounted(() => {
    mq = window.matchMedia('(prefers-color-scheme: dark)')
    systemDark.value = mq.matches
    mq.addEventListener('change', onSystemChange)
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as ThemeChoice | null
      if (stored === 'dark' || stored === 'light') choice.value = stored
    } catch {
      /* private mode — stay on system */
    }
  })

  onBeforeUnmount(() => mq?.removeEventListener('change', onSystemChange))

  /** Two-state toggle against what the reader is currently seeing. */
  const toggle = () => {
    const next: ThemeChoice = isDark.value ? 'light' : 'dark'
    choice.value = next
    apply(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      /* ignore */
    }
  }

  return { choice, isDark, toggle }
}
