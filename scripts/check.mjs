// Statische Prüfungen für index.html:
//  - JavaScript ist syntaktisch gültig
//  - keine persönlichen Einstellungen eingebettet (Datenschutz)
//  - keine Emojis in der Oberfläche
import { readFileSync } from 'node:fs'
import vm from 'node:vm'

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8')
let fehler = 0
const fail = (msg) => { console.error('✗ ' + msg); fehler++ }
const ok = (msg) => console.log('✓ ' + msg)

const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1])
scripts.forEach((code, i) => {
  try { new vm.Script(code, { filename: `index.html#script${i}` }); ok(`Script ${i}: Syntax gültig`) }
  catch (e) { fail(`Script ${i}: ${e.message}`) }
})

const embedded = html.match(/<script id="embedded-settings" type="application\/json">([\s\S]*?)<\/script>/)
if (!embedded) fail('Block "embedded-settings" fehlt')
else if (embedded[1].trim() !== '{}') fail('Persönliche Einstellungen sind in index.html eingebettet – bitte vor dem Commit entfernen')
else ok('Keine persönlichen Einstellungen eingebettet')

const emoji = html.match(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u)
if (emoji) fail(`Emoji gefunden: ${emoji[0]}`)
else ok('Keine Emojis')

if (fehler) { console.error(`\n${fehler} Problem(e) gefunden`); process.exit(1) }
console.log('\nAlle Prüfungen bestanden')
