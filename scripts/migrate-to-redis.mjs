import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import ts from 'typescript';

const ROOT = process.cwd();
const STATE_KEY = 'lapatrona_pos_cloud_state_v2';

function loadEnvLocal() {
  const envPath = path.join(ROOT, '.env.local');
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex <= 0) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    const rawVal = trimmed.slice(eqIndex + 1).trim();
    const val = rawVal.replace(/^["']|["']$/g, '');
    if (!(key in process.env)) {
      process.env[key] = val;
    }
  }
}

function loadTsDataModule(relPath) {
  const fullPath = path.join(ROOT, relPath);
  const source = fs.readFileSync(fullPath, 'utf8');
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
    },
    fileName: fullPath,
  });

  const mod = { exports: {} };
  const require = createRequire(fullPath);
  const safeRequire = (id) => (id.startsWith('@/types/') ? {} : require(id));
  const wrapped = `(function (exports, require, module, __filename, __dirname) {\n${transpiled.outputText}\n})`;
  const compiledFn = vm.runInThisContext(wrapped, { filename: fullPath });
  compiledFn(mod.exports, safeRequire, mod, fullPath, path.dirname(fullPath));
  return mod.exports;
}

async function main() {
  loadEnvLocal();

  const kvUrl = (process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || '').replace(/\/+$/, '');
  const kvToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || '';

  if (!kvUrl || !kvToken) {
    console.error('Missing KV_REST_API_URL / KV_REST_API_TOKEN (or UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN).');
    process.exit(1);
  }

  const force = process.argv.includes('--force');

  const existingRes = await fetch(`${kvUrl}/get/${STATE_KEY}`, {
    headers: { Authorization: `Bearer ${kvToken}` },
  });
  if (!existingRes.ok) {
    console.error(`Failed to read ${STATE_KEY} from Redis: HTTP ${existingRes.status}`);
    process.exit(1);
  }
  const existingJson = await existingRes.json();
  const { NOTEBOOK_INITIAL_SALES, NOTEBOOK_CLOSED_SHIFTS } = loadTsDataModule('src/data/notebookSalesData.ts');
  const { INITIAL_TICKET_EXPENSES } = loadTsDataModule('src/data/purchaseTicketsData.ts');
  const { INITIAL_PRODUCTS, INITIAL_STOCK } = loadTsDataModule('src/data/initialProducts.ts');
  const { DEFAULT_BUSINESS_INFO } = loadTsDataModule('src/data/initialBusinessInfo.ts');

  const defaults = {
    sales: NOTEBOOK_INITIAL_SALES,
    expenses: INITIAL_TICKET_EXPENSES,
    closedShifts: NOTEBOOK_CLOSED_SHIFTS,
    products: INITIAL_PRODUCTS,
    startingCash: 50,
    wasteRecords: [],
    stockMap: INITIAL_STOCK,
    businessInfo: DEFAULT_BUSINESS_INFO,
    dailyGoal: 2000,
    shiftCounter: 6,
  };

  let payload = defaults;
  if (existingJson?.result && !force) {
    const parsed = typeof existingJson.result === 'string' ? JSON.parse(existingJson.result) : existingJson.result;
    const missingKeys = Object.keys(defaults).filter((k) => parsed?.[k] === undefined);
    if (missingKeys.length === 0) {
      console.log(
        `Redis key "${STATE_KEY}" already has all migrated fields (sales: ${parsed?.sales?.length ?? 0}, expenses: ${parsed?.expenses?.length ?? 0}, closedShifts: ${parsed?.closedShifts?.length ?? 0}, products: ${parsed?.products?.length ?? 0}). Pass --force to overwrite.`
      );
      return;
    }
    payload = { ...defaults, ...parsed };
    console.log(`Backfilling missing Redis fields into "${STATE_KEY}": ${missingKeys.join(', ')} (preserving existing data).`);
  }

  const setRes = await fetch(kvUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${kvToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(['SET', STATE_KEY, JSON.stringify(payload)]),
  });
  const setJson = await setRes.json().catch(() => null);

  if (!setRes.ok || setJson?.error) {
    console.error('Failed to write migrated state to Redis:', setRes.status, setJson?.error);
    process.exit(1);
  }

  const verifyRes = await fetch(`${kvUrl}/get/${STATE_KEY}`, {
    headers: { Authorization: `Bearer ${kvToken}` },
  });
  const verifyJson = await verifyRes.json();
  const verified = JSON.parse(verifyJson.result);

  if (
    !Array.isArray(verified?.sales) ||
    verified.sales.length !== payload.sales.length ||
    !Array.isArray(verified?.expenses) ||
    verified.expenses.length !== payload.expenses.length ||
    !Array.isArray(verified?.closedShifts) ||
    verified.closedShifts.length !== payload.closedShifts.length ||
    !Array.isArray(verified?.products) ||
    verified.products.length !== payload.products.length
  ) {
    console.error('Verification mismatch after writing to Redis.');
    process.exit(1);
  }

  console.log(
    `Migrated hardcoded database to Upstash Redis key "${STATE_KEY}": ` +
      `${verified.sales.length} sales, ${verified.expenses.length} expenses, ` +
      `${verified.closedShifts.length} closedShifts, ${verified.products.length} products, ` +
      `startingCash=$${verified.startingCash}.`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
