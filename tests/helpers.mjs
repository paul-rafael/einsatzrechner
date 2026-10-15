import { readFileSync } from 'node:fs'
import { JSDOM } from 'jsdom'

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8')

// Lädt die App in einer simulierten Browser-Umgebung und gibt Zugriff auf ihren Zustand
export function ladeApp() {
  const dom = new JSDOM(html, {
    runScripts: 'dangerously',
    url: 'https://example.test/',
    beforeParse(win) {
      win.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} })
      win.confirm = () => true
    },
  })
  const run = (code) => dom.window.eval(code)
  return {
    run,
    // Setzt einen Monat mit Tagen auf und liefert das Lohnzettel-Ergebnis
    rechne({ monat = 10, jahr = 2026, grundgehalt = 3000, taggeld = 0, tage = {}, lehrling = false, urlaubsgeld = 0, extras = [] } = {}) {
      dom.window.__in = { monat, jahr, grundgehalt, taggeld, tage, lehrling, urlaubsgeld, extras }
      return run(`(() => {
        const i = window.__in
        Object.assign(state, { monat: i.monat, jahr: i.jahr, grundgehalt: i.grundgehalt, taggeld: i.taggeld,
          lehrling: i.lehrling, zaTopfMax: 0, zaTopfStart: 0, ruheStart: 0, dayMap: i.tage,
          urlaubsgeldAktiv: i.urlaubsgeld > 0, urlaubsgeldBetrag: i.urlaubsgeld, extras: i.extras })
        calcStundensatz()
        const tage = berechneMonat(getWeeksOfMonth(state.monat, state.jahr), state.dayMap)
        const ruhe = verteileAbwesenheit(tage, state.ruheStart)
        const lz = berechneLohnzettel(tage, state.grundgehalt, state.stundensatz, state.taggeld, state.zaTopfMax,
          state.zaTopfStart, state.urlaubsgeldAktiv, state.urlaubsgeldBetrag, state.extras)
        tage.forEach((t) => { t.key = dateKey(t.datum) })
        return JSON.parse(JSON.stringify({ lz, ruhe, tage }))
      })()`)
    },
  }
}
