"use server";

import connectDB from "@/lib/mongodb";
import Event from "@/database/event.model";
import type { IEvent } from "@/database/event.model";

export async function getEvents(): Promise<IEvent[]> {
  await connectDB();
  return Event.find().sort({ createdAt: -1 }).lean<IEvent[]>();
}


export async function getEventBySlug(slug: string): Promise<IEvent | null> {
  try {
    await connectDB();
    return Event.findOne({ slug }).lean<IEvent>();

  } catch (error) {
    console.error(`Error fetching event with slug ${slug}:`, error);
    return null;
  }
}

export async function getSimilarEvents(slug: string) {
  try {
    await connectDB();
    const event = await Event.findOne({ slug });
    if (!event) {
      return [];
    }
    return Event.find({
      _id: { $ne: event },
      tags: { $in: event.tags },
    }).lean<IEvent[]>();

  } catch (error) {
    console.error(`Error fetching similar events for slug ${slug}:`, error);
    return [];
  }
}