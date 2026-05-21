"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { projectNoteToCalendar, deleteCalendarProjection } from "@/lib/google-calendar";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import type { Note, NoteColor } from "@/lib/types";

const colors = new Set<NoteColor>(["plain", "amber", "mint", "rose", "sky"]);

function optionalText(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function optionalDueAt(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || !value) {
    return null;
  }

  return new Date(value).toISOString();
}

function colorValue(value: FormDataEntryValue | null): NoteColor {
  return typeof value === "string" && colors.has(value as NoteColor)
    ? (value as NoteColor)
    : "plain";
}

async function fetchOwnedNote(id: string, userId: string) {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("notes")
    .select()
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function createNote(formData: FormData) {
  const user = await requireUser();
  const admin = createSupabaseAdminClient();
  const now = new Date().toISOString();
  const payload = {
    user_id: user.id,
    title: optionalText(formData.get("title")),
    content: optionalText(formData.get("content")),
    color: colorValue(formData.get("color")),
    due_at: optionalDueAt(formData.get("due_at")),
    is_pinned: formData.get("is_pinned") === "on",
    calendar_projection_status: "none" as const,
    created_at: now,
    updated_at: now
  };

  if (!payload.title && !payload.content) {
    redirect("/?error=empty-note");
  }

  const { data, error } = await admin.from("notes").insert(payload).select().single();

  if (error) {
    throw new Error(error.message);
  }

  await projectNoteToCalendar(data);
  revalidatePath("/");
  redirect("/");
}

export async function updateNote(formData: FormData) {
  const user = await requireUser();
  const id = optionalText(formData.get("id"));
  const admin = createSupabaseAdminClient();
  const existing = await fetchOwnedNote(id, user.id);

  const patch = {
    title: optionalText(formData.get("title")),
    content: optionalText(formData.get("content")),
    color: colorValue(formData.get("color")),
    due_at: optionalDueAt(formData.get("due_at")),
    is_pinned: formData.get("is_pinned") === "on",
    updated_at: new Date().toISOString()
  };

  const { data, error } = await admin
    .from("notes")
    .update(patch)
    .eq("id", existing.id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  await projectNoteToCalendar(data);
  revalidatePath("/");
  redirect("/");
}

export async function archiveNote(formData: FormData) {
  const user = await requireUser();
  const id = optionalText(formData.get("id"));
  const note = await fetchOwnedNote(id, user.id);
  const admin = createSupabaseAdminClient();

  const { error } = await admin
    .from("notes")
    .update({ is_archived: !note.is_archived, updated_at: new Date().toISOString() })
    .eq("id", note.id)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/");
}

export async function deleteNote(formData: FormData) {
  const user = await requireUser();
  const id = optionalText(formData.get("id"));
  const note: Note = await fetchOwnedNote(id, user.id);
  const admin = createSupabaseAdminClient();

  await deleteCalendarProjection(note);

  const { error } = await admin.from("notes").delete().eq("id", note.id).eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/");
}
