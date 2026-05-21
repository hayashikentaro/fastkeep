import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { serverEnv } from "@/lib/env";
import type { GoogleConnection, Note } from "@/lib/types";

type TokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  scope?: string;
  token_type: string;
};

type CalendarEventResponse = {
  id: string;
};

export function googleAuthUrl(state: string) {
  const config = serverEnv();
  const params = new URLSearchParams({
    client_id: config.GOOGLE_CLIENT_ID,
    redirect_uri: config.GOOGLE_REDIRECT_URI,
    response_type: "code",
    access_type: "offline",
    prompt: "consent",
    scope: "https://www.googleapis.com/auth/calendar.events",
    state
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeCodeForTokens(code: string) {
  const config = serverEnv();
  const body = new URLSearchParams({
    code,
    client_id: config.GOOGLE_CLIENT_ID,
    client_secret: config.GOOGLE_CLIENT_SECRET,
    redirect_uri: config.GOOGLE_REDIRECT_URI,
    grant_type: "authorization_code"
  });

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body
  });

  if (!response.ok) {
    throw new Error("Google の認証コード交換に失敗しました。");
  }

  return (await response.json()) as TokenResponse;
}

export function expiresAt(expiresIn?: number) {
  if (!expiresIn) {
    return null;
  }

  return new Date(Date.now() + expiresIn * 1000).toISOString();
}

async function refreshAccessToken(connection: GoogleConnection) {
  if (!connection.refresh_token) {
    return connection;
  }

  if (connection.expires_at && new Date(connection.expires_at).getTime() > Date.now() + 60_000) {
    return connection;
  }

  const config = serverEnv();
  const body = new URLSearchParams({
    client_id: config.GOOGLE_CLIENT_ID,
    client_secret: config.GOOGLE_CLIENT_SECRET,
    refresh_token: connection.refresh_token,
    grant_type: "refresh_token"
  });

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body
  });

  if (!response.ok) {
    throw new Error("Google アクセストークンの更新に失敗しました。");
  }

  const token = (await response.json()) as TokenResponse;
  const admin = createSupabaseAdminClient();
  const updated = {
    access_token: token.access_token,
    expires_at: expiresAt(token.expires_in),
    updated_at: new Date().toISOString()
  };

  const { data, error } = await admin
    .from("google_connections")
    .update(updated)
    .eq("user_id", connection.user_id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

async function calendarFetch<T>(
  connection: GoogleConnection,
  path: string,
  init: RequestInit = {}
) {
  const activeConnection = await refreshAccessToken(connection);
  const response = await fetch(`https://www.googleapis.com/calendar/v3${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${activeConnection.access_token}`,
      "Content-Type": "application/json",
      ...init.headers
    }
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || "Google Calendar API の呼び出しに失敗しました。");
  }

  if (response.status === 204) {
    return null as T;
  }

  return (await response.json()) as T;
}

function buildEvent(note: Note) {
  if (!note.due_at) {
    throw new Error("期限がないメモは Calendar に投影できません。");
  }

  const start = new Date(note.due_at);
  const end = new Date(start.getTime() + 30 * 60 * 1000);
  const summary = note.title.trim() || "FastKeep メモ";
  const description = [note.content, "", "FastKeep から作成された予定です。"].join("\n").trim();

  return {
    summary,
    description,
    start: { dateTime: start.toISOString() },
    end: { dateTime: end.toISOString() },
    reminders: { useDefault: true }
  };
}

export async function projectNoteToCalendar(note: Note) {
  const admin = createSupabaseAdminClient();
  const { data: connection } = await admin
    .from("google_connections")
    .select()
    .eq("user_id", note.user_id)
    .maybeSingle();

  if (!connection) {
    await admin
      .from("notes")
      .update({
        calendar_projection_status: "none",
        calendar_projection_error: null,
        updated_at: new Date().toISOString()
      })
      .eq("id", note.id);
    return;
  }

  try {
    if (!note.due_at) {
      if (note.calendar_event_id) {
        await calendarFetch(connection, `/calendars/primary/events/${note.calendar_event_id}`, {
          method: "DELETE"
        });
      }

      await admin
        .from("notes")
        .update({
          calendar_event_id: null,
          calendar_projection_status: "none",
          calendar_projection_error: null,
          updated_at: new Date().toISOString()
        })
        .eq("id", note.id);
      return;
    }

    const event = buildEvent(note);
    const projected = note.calendar_event_id
      ? await calendarFetch<CalendarEventResponse>(
          connection,
          `/calendars/primary/events/${note.calendar_event_id}`,
          { method: "PATCH", body: JSON.stringify(event) }
        )
      : await calendarFetch<CalendarEventResponse>(connection, "/calendars/primary/events", {
          method: "POST",
          body: JSON.stringify(event)
        });

    await admin
      .from("notes")
      .update({
        calendar_event_id: projected.id,
        calendar_projection_status: "synced",
        calendar_projection_error: null,
        updated_at: new Date().toISOString()
      })
      .eq("id", note.id);
  } catch (error) {
    await admin
      .from("notes")
      .update({
        calendar_projection_status: "error",
        calendar_projection_error: error instanceof Error ? error.message : "不明なエラーです。",
        updated_at: new Date().toISOString()
      })
      .eq("id", note.id);
  }
}

export async function deleteCalendarProjection(note: Note) {
  if (!note.calendar_event_id) {
    return;
  }

  const admin = createSupabaseAdminClient();
  const { data: connection } = await admin
    .from("google_connections")
    .select()
    .eq("user_id", note.user_id)
    .maybeSingle();

  if (!connection) {
    return;
  }

  try {
    await calendarFetch(connection, `/calendars/primary/events/${note.calendar_event_id}`, {
      method: "DELETE"
    });
  } catch {
    return;
  }
}
