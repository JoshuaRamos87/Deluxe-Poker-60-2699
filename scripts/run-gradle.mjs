import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

const args = process.argv.slice(2);
const androidDir = resolve(process.cwd(), 'android');
const isWin = process.platform === 'win32';
const cmd = isWin ? 'gradlew.bat' : 'sh';
const cmdArgs = isWin ? args : ['./gradlew', ...args];

const result = spawnSync(cmd, cmdArgs, {
  cwd: androidDir,
  stdio: 'inherit',
  shell: isWin,
});

if (result.error) {
  console.error(result.error);
  process.exit(1);
}

process.exit(result.status ?? 1);
