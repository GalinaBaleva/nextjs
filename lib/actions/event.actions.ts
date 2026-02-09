'use server'

import Event from '@/database/event.model';
import connectDB from "@/lib/mongodb";
import type { IEvent } from '@/database/event.model';

export async function getSimilarEventsBySlug(slug: string): Promise<IEvent[]> {
  try {
    await connectDB();

    const event = await Event.findOne({ slug }).lean<IEvent>();
    if (!event) return [];

    const similarEvents = await Event.find({
      _id: { $ne: event._id },
      tags: { $in: event.tags },
    }).lean<IEvent[]>();   

    return similarEvents;
  } catch (e) {
    return [];
  }
}
