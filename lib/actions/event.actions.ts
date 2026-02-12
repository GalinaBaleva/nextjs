"use server";

import connectDB from "@/lib/mongodb";
import Event from "@/database/event.model";
import type { IEvent } from "@/database/event.model";

export async function getEvents(): Promise<IEvent[]> {
  await connectDB();
  return Event.find().sort({ createdAt: -1 }).lean<IEvent[]>();
}


export async function getEventBySlug(slug: string): Promise<IEvent | null> {
  await connectDB();
  return Event.findOne({ slug }).lean<IEvent>();
}