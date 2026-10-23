import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

type AuthorizedLocation = {
  election_name: string | null;
  department: string;
  municipality: string;
  polling_place: string;
  polling_place_address: string | null;
  polling_table: number;
  source: string;
  source_updated_at: string | null;
};

function json(body: Record<string, unknown>, status = 200) {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}

export async function POST(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const authorization = request.headers.get("authorization");

  if (!supabaseUrl || !supabaseKey) return json({ ok: false, code: "not_configured" }, 503);
  if (!authorization?.startsWith("Bearer ")) return json({ ok: false, code: "unauthorized" }, 401);

  let documentNumber = "";
  try {
    const body = await request.json() as { documentNumber?: unknown };
    documentNumber = String(body.documentNumber ?? "").replace(/\D/g, "");
  } catch {
    return json({ ok: false, code: "invalid_request" }, 400);
  }

  if (!/^\d{5,12}$/.test(documentNumber)) {
    return json({ ok: false, code: "invalid_document" }, 400);
  }

  const token = authorization.slice("Bearer ".length);
  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: authorization } },
  });
  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  if (userError || !userData.user) return json({ ok: false, code: "unauthorized" }, 401);

  const bytes = new TextEncoder().encode(documentNumber);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  const documentHash = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");

  const { data, error } = await supabase.rpc("verify_electoral_registration", { lookup_hash: documentHash });
  if (error) {
    if (error.message?.includes("rate_limited")) {
      return json({ ok: false, code: "rate_limited" }, 429);
    }
    if (error.code === "PGRST202" || error.code === "42883") {
      return json({ ok: false, code: "registry_not_ready" }, 503);
    }
    return json({ ok: false, code: "lookup_failed" }, 502);
  }

  const location = (Array.isArray(data) ? data[0] : data) as AuthorizedLocation | null;
  if (!location) return json({ ok: true, found: false });

  return json({
    ok: true,
    found: true,
    location: {
      electionName: location.election_name,
      department: location.department,
      municipality: location.municipality,
      pollingPlace: location.polling_place,
      pollingPlaceAddress: location.polling_place_address,
      pollingTable: location.polling_table,
      source: location.source,
      sourceUpdatedAt: location.source_updated_at,
    },
  });
}
