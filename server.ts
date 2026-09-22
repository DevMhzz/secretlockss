import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const DATA_FILE = path.join(process.cwd(), 'treasure-state.json');
const CONFIG_FILE = path.join(process.cwd(), 'site-config.json');

interface SiteConfig {
  hint: string;
  showHint: boolean;
  timeLengthMinutes: number;
  timerEnabled: boolean;
  timerStartedAt: number | null;
  serverTime?: number;
  remainingSeconds?: number | null;
}

const DEFAULT_CONFIG: SiteConfig = {
  hint: '',
  showHint: false,
  timeLengthMinutes: 10,
  timerEnabled: false,
  timerStartedAt: null,
};

function getRawSavedConfig(): SiteConfig {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const content = fs.readFileSync(CONFIG_FILE, 'utf-8');
      return { ...DEFAULT_CONFIG, ...JSON.parse(content) };
    }
  } catch (err) {
    console.error('Error reading site-config.json:', err);
  }
  return DEFAULT_CONFIG;
}

function getSiteConfig(): SiteConfig {
  const raw = getRawSavedConfig();
  const now = Date.now();
  let remainingSeconds: number | null = null;

  if (raw.timerEnabled && raw.timerStartedAt) {
    const totalSeconds = (Number(raw.timeLengthMinutes) || 10) * 60;
    const elapsedSeconds = Math.floor((now - raw.timerStartedAt) / 1000);
    remainingSeconds = Math.max(0, totalSeconds - elapsedSeconds);
  }

  return {
    ...raw,
    serverTime: now,
    remainingSeconds,
  };
}

function saveSiteConfig(newConfig: Partial<SiteConfig> & { startTimerNow?: boolean }): SiteConfig {
  try {
    const current = getRawSavedConfig();
    const updated: SiteConfig = {
      hint: newConfig.hint !== undefined ? String(newConfig.hint) : current.hint,
      showHint: newConfig.showHint !== undefined ? Boolean(newConfig.showHint) : current.showHint,
      timeLengthMinutes: newConfig.timeLengthMinutes !== undefined ? Math.max(1, Number(newConfig.timeLengthMinutes)) : current.timeLengthMinutes,
      timerEnabled: newConfig.timerEnabled !== undefined ? Boolean(newConfig.timerEnabled) : current.timerEnabled,
      timerStartedAt: newConfig.timerStartedAt !== undefined ? newConfig.timerStartedAt : current.timerStartedAt,
    };

    // Explicit request to start timer now
    if (newConfig.startTimerNow) {
      updated.timerEnabled = true;
      updated.timerStartedAt = Date.now();
    } else if (updated.timerEnabled) {
      // If timer is enabled but had no valid start time, start it now
      if (!updated.timerStartedAt) {
        updated.timerStartedAt = Date.now();
      }
    } else {
      // Timer is disabled
      updated.timerStartedAt = null;
    }

    fs.writeFileSync(
      CONFIG_FILE,
      JSON.stringify(
        {
          hint: updated.hint,
          showHint: updated.showHint,
          timeLengthMinutes: updated.timeLengthMinutes,
          timerEnabled: updated.timerEnabled,
          timerStartedAt: updated.timerStartedAt,
        },
        null,
        2
      )
    );

    return getSiteConfig();
  } catch (err) {
    console.error('Error writing site-config.json:', err);
    return getSiteConfig();
  }
}

function getTreasureDismissed(): boolean {
  return false;
}

function setTreasureDismissed(): void {
  // Treasure is kept permanently
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Cross-browser persistent treasure status
  app.get('/api/treasure/status', (req, res) => {
    const dismissed = getTreasureDismissed();
    res.json({ dismissed });
  });

  app.post('/api/treasure/dismiss', (req, res) => {
    setTreasureDismissed();
    res.json({ success: true, dismissed: true });
  });

  // Discord Webhook Notification Endpoint for "do u want me to ask u out?"
  app.post('/api/make-move', async (req, res) => {
    try {
      const { choice } = req.body;
      const normalizedChoice = typeof choice === 'string' ? choice.toLowerCase() : '';
      if (
        normalizedChoice !== 'yes' &&
        normalizedChoice !== 'good' &&
        normalizedChoice !== 'awful' &&
        choice !== 'ME' &&
        choice !== 'YOU'
      ) {
        return res.status(400).json({ error: 'Choice must be yes' });
      }

      const webhookUrl =
        'https://discord.com/api/webhooks/1551427649619099669/d0BST70-X2z87cf9W2HpesoSCH2GtZqcN73blX-hATB0OmennNNPpdxm4rBiHfNdpcrZ';

      const displayChoice = normalizedChoice || choice;
      const color = 0xff69b4;

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: `💌 **Question:** do u want me to ask u out?\n👉 **Answer:** \`${displayChoice}\`\n⏰ *${new Date().toLocaleString()}*`,
          embeds: [
            {
              title: '💖 Ask Out Response Received!',
              description: `**Question:** do u want me to ask u out?\n**Selected:** \`${displayChoice}\``,
              color,
              timestamp: new Date().toISOString(),
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Discord webhook responded with error:', errorText);
      }

      res.json({ success: true, choice: displayChoice });
    } catch (err) {
      console.error('Failed to send Discord webhook:', err);
      res.status(500).json({ error: 'Failed to notify webhook' });
    }
  });

  // Site Configuration API (hints & timer visible to everyone)
  app.get('/api/config', (req, res) => {
    const config = getSiteConfig();
    res.json(config);
  });

  app.post('/api/config', (req, res) => {
    const updated = saveSiteConfig(req.body);
    res.json({ success: true, config: updated });
  });

  // Vite middleware in dev / static in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
