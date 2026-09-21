import { MongoClient } from "mongodb";

async function pingMongo() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set");

  const client = new MongoClient(uri);
  try {
    await client.connect();
    await client.db().command({ ping: 1 });
    console.log("MongoDB ping OK");
  } finally {
    await client.close();
  }
}

async function pingSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url) throw new Error("SUPABASE_URL is not set");
  if (!key) throw new Error("SUPABASE_ANON_KEY is not set");

  const res = await fetch(`${url}/rest/v1/`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
    },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "<no body>");
    throw new Error(
      `Supabase ping failed: ${res.status} ${res.statusText} — ${body} (url: ${url}, key prefix: ${key.slice(0, 12)}..., key length: ${key.length})`,
    );
  }
  console.log("Supabase ping OK");
}

const results = await Promise.allSettled([pingMongo(), pingSupabase()]);

let failed = false;
for (const result of results) {
  if (result.status === "rejected") {
    failed = true;
    console.error(result.reason?.message ?? result.reason);
  }
}

if (failed) {
  process.exit(1);
}
