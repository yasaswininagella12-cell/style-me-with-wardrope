import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import EmbeddedPostgres from "embedded-postgres";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

export const DB = {
  dataDir: path.join(rootDir, ".data", "pg"),
  host: "127.0.0.1",
  port: 5433,
  user: "postgres",
  password: "postgres",
  database: "styleme",
};

export function newPg() {
  return new EmbeddedPostgres({
    databaseDir: DB.dataDir,
    port: DB.port,
    user: DB.user,
    password: DB.password,
    persistent: true,
  });
}

export function isInitialised() {
  return existsSync(path.join(DB.dataDir, "PG_VERSION"));
}

export async function initialise() {
  if (isInitialised()) {
    console.log(`[db] cluster already initialised at ${DB.dataDir}`);
    return;
  }
  await mkdir(path.dirname(DB.dataDir), { recursive: true });
  const pg = newPg();
  await pg.initialise();
  console.log(`[db] cluster initialised at ${DB.dataDir}`);
}

export async function start() {
  await initialise();
  const pg = newPg();
  await pg.start();
  console.log(`[db] postgres listening on ${DB.host}:${DB.port} (Ctrl+C to stop)`);
  return pg;
}

export async function createDatabase() {
  const { Client } = await import("pg");
  const client = new Client({
    host: DB.host,
    port: DB.port,
    user: DB.user,
    password: DB.password,
    database: "postgres",
  });
  await client.connect();
  const exists = await client.query(
    "SELECT 1 FROM pg_database WHERE datname = $1",
    [DB.database],
  );
  if (exists.rowCount === 0) {
    await client.query(`CREATE DATABASE "${DB.database}"`);
    console.log(`[db] created database "${DB.database}"`);
  } else {
    console.log(`[db] database "${DB.database}" already exists`);
  }
  await client.end();
}

export function printHelp() {
  console.log(`
Usage: node scripts/db.mjs <command>

  init       Create the Postgres cluster under .data/pg (idempotent)
  start      Initialise, start the server and create the "styleme"
             database. Stays in the foreground; press Ctrl+C to stop.
  stop       Stop a running server (if managed by this process).
  help       Show this help
`);
}

const [command] = process.argv.slice(2);

(async () => {
  try {
    switch (command) {
      case "init":
        await initialise();
        break;
      case "start": {
        const pg = await start();
        await createDatabase();
        await new Promise((resolve) => pg.process?.on("close", resolve));
        break;
      }
      case "stop": {
        const pg = newPg();
        await pg.stop();
        console.log("[db] server stopped");
        break;
      }
      default:
        printHelp();
        process.exitCode = 1;
    }
  } catch (err) {
    console.error(`[db] ERROR: ${err?.message ?? err}`);
    process.exitCode = 1;
  }
})();