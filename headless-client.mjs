/**
 * Persistent headless browser client that keeps the sandybox
 * renderer/game loop running so agent state files get processed.
 */
import { chromium } from 'playwright';

const URL = process.argv[2] || 'http://localhost:3000';

async function main() {
  console.log(`Starting headless sandybox client → ${URL}`);
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  page.on('console', msg => {
    if (msg.type() === 'error') console.error('[renderer]', msg.text());
  });

  await page.goto(URL, { waitUntil: 'domcontentloaded' });
  console.log('Renderer loaded — game loop is running.');

  // Keep alive, take a health-check screenshot every 60s
  setInterval(async () => {
    try {
      const todd = await page.evaluate(() =>
        fetch('/api/state/agents/todd').then(r => r.json()).catch(() => null)
      );
      if (todd) {
        console.log(`[health] Todd: ${todd.status.current_action} in ${todd.status.room} @ ${new Date(todd.status.timestamp).toLocaleTimeString()}`);
      }
    } catch {}
  }, 60000);

  // Handle shutdown
  process.on('SIGINT', async () => { await browser.close(); process.exit(); });
  process.on('SIGTERM', async () => { await browser.close(); process.exit(); });
}

main().catch(e => { console.error(e); process.exit(1); });
