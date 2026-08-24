/**
 * PM2 process file for a Linux host.
 *
 * Start from any directory; paths are resolved from this file:
 *   pm2 start ecosystem.config.cjs
 *
 * Rate limiting is in-process memory. Keep `instances: 1` (fork) until Redis
 * is introduced. Do not set wait_ready: Nest does not send process.send('ready').
 *
 * Do not use pnpm/npm as PID 1. Nest loads `backend/.env` from cwd.
 * Next loads `frontend/.env.production` / `.env.local` from cwd.
 * Logs are written under <repo>/logs (gitignored, not a public web root).
 */
const path = require('path');

const root = __dirname;
const logs = path.join(root, 'logs');

module.exports = {
  apps: [
    {
      name: 'parvanerazaghiart-api',
      cwd: path.join(root, 'backend'),
      script: './dist/main.js',
      interpreter: 'node',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '400M',
      min_uptime: '5s',
      max_restarts: 12,
      restart_delay: 4000,
      exp_backoff_restart_delay: 200,
      kill_timeout: 8000,
      env: {
        NODE_ENV: 'production',
        PORT: '3001',
      },
      out_file: path.join(logs, 'api-out.log'),
      error_file: path.join(logs, 'api-error.log'),
      merge_logs: true,
      time: true,
    },
    {
      name: 'parvanerazaghiart-web',
      cwd: path.join(root, 'frontend'),
      script: './node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      interpreter: 'node',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      min_uptime: '5s',
      max_restarts: 12,
      restart_delay: 4000,
      exp_backoff_restart_delay: 200,
      kill_timeout: 8000,
      env: {
        NODE_ENV: 'production',
        PORT: '3000',
      },
      out_file: path.join(logs, 'web-out.log'),
      error_file: path.join(logs, 'web-error.log'),
      merge_logs: true,
      time: true,
    },
  ],
};
