const compression = require('compression');
const crypto = require('crypto');
const express = require('express');
const helmet = require('helmet');
const os = require('os');
const path = require('path');
const rateLimit = require('express-rate-limit');

const app = express();
const startedAt = new Date();
const appName = process.env.APP_NAME || 'GHSCD Live Demo App';

app.disable('x-powered-by');
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(compression());
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "script-src": ["'self'", "'unsafe-inline'"],
        "style-src": ["'self'", "'unsafe-inline'"],
        "img-src": ["'self'", 'data:']
      }
    }
  })
);
app.use(
  rateLimit({
    windowMs: 60 * 1000,
    limit: 120,
    standardHeaders: 'draft-7',
    legacyHeaders: false
  })
);
app.use(express.urlencoded({ extended: false }));
app.use(express.json({ limit: '64kb' }));
app.use('/static', express.static(path.join(__dirname, 'public'), { maxAge: '1h' }));

function commonLocals(req) {
  return {
    appName,
    path: req.path,
    year: new Date().getFullYear(),
    isVercel: Boolean(process.env.VERCEL),
    environment: process.env.VERCEL_ENV || process.env.NODE_ENV || 'local'
  };
}

function getMetrics() {
  const memory = process.memoryUsage();
  const cpu = process.cpuUsage();
  return {
    pid: process.pid,
    uptimeSeconds: Math.round(process.uptime()),
    startedAt: startedAt.toISOString(),
    memory: {
      rssMb: Math.round(memory.rss / 1024 / 1024),
      heapUsedMb: Math.round(memory.heapUsed / 1024 / 1024),
      heapTotalMb: Math.round(memory.heapTotal / 1024 / 1024)
    },
    cpu: {
      userMs: Math.round(cpu.user / 1000),
      systemMs: Math.round(cpu.system / 1000)
    }
  };
}

app.get('/', (req, res) => {
  res.render('home', {
    ...commonLocals(req),
    cards: [
      {
        title: 'Info',
        text: 'Mostra detalhes seguros sobre runtime, ambiente e versão do Node.js.',
        href: '/info'
      },
      {
        title: 'Monitor',
        text: 'Exibe métricas simples de memória, CPU e uptime para demos de observabilidade.',
        href: '/monitor'
      },
      {
        title: 'Tools',
        text: 'Ferramentas seguras para demo: hash SHA-256, echo escapado, erro controlado e carga leve.',
        href: '/tools'
      }
    ]
  });
});

app.get('/info', (req, res) => {
  res.render('info', {
    ...commonLocals(req),
    info: {
      node: process.version,
      platform: process.platform,
      architecture: process.arch,
      hostname: os.hostname(),
      cpus: os.cpus().length,
      totalMemoryMb: Math.round(os.totalmem() / 1024 / 1024),
      freeMemoryMb: Math.round(os.freemem() / 1024 / 1024),
      uptimeSeconds: Math.round(process.uptime()),
      vercelRegion: process.env.VERCEL_REGION || 'local/not set',
      commitSha: process.env.VERCEL_GIT_COMMIT_SHA || 'local/not set'
    }
  });
});

app.get('/monitor', (req, res) => {
  res.render('monitor', {
    ...commonLocals(req),
    metrics: getMetrics()
  });
});

app.get('/tools', (req, res) => {
  res.render('tools', {
    ...commonLocals(req),
    hashResult: null,
    echoResult: null,
    loadResult: null
  });
});

app.post('/tools/hash', (req, res) => {
  const text = String(req.body.text || '').slice(0, 2000);
  const hashResult = crypto.createHash('sha256').update(text, 'utf8').digest('hex');
  res.render('tools', {
    ...commonLocals(req),
    hashResult,
    echoResult: null,
    loadResult: null
  });
});

app.post('/tools/echo', (req, res) => {
  const echoResult = String(req.body.message || '').slice(0, 500);
  res.render('tools', {
    ...commonLocals(req),
    hashResult: null,
    echoResult,
    loadResult: null
  });
});

app.post('/tools/load', (req, res) => {
  const iterations = Math.min(Number(req.body.iterations || 25000), 250000);
  let total = 0;
  for (let i = 0; i < iterations; i += 1) {
    total += Math.sqrt(i);
  }
  res.render('tools', {
    ...commonLocals(req),
    hashResult: null,
    echoResult: null,
    loadResult: `Carga leve executada com ${iterations} iterações. Resultado: ${total.toFixed(2)}`
  });
});

app.get('/tools/error', (req, res, next) => {
  next(new Error('Erro controlado gerado para demonstração de observabilidade.'));
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: appName, time: new Date().toISOString() });
});

app.get('/api/version', (req, res) => {
  res.json({ name: appName, version: '1.0.0', node: process.version });
});

app.get('/api/metrics', (req, res) => {
  res.json(getMetrics());
});

app.get('/ready', (req, res) => {
  res.status(200).json({ ready: true });
});

app.use((req, res) => {
  res.status(404).render('not-found', { ...commonLocals(req) });
});

app.use((err, req, res, _next) => {
  res.status(500).render('error', {
    ...commonLocals(req),
    message: err.message || 'Erro inesperado'
  });
});

module.exports = app;

if (require.main === module) {
  const port = Number(process.env.PORT || 3000);
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`${appName} running at http://localhost:${port}`);
  });
}
