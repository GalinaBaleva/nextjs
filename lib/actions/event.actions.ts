'use server'

import Event, { IEvent } from '@/database/event.model';
import connectDB from "@/lib/mongodb";

export async function getSimilarEventsBySlug(slug: string): Promise<IEvent[]> {
    try {
        await connectDB();
        const event = await Event.findOne({ slug });
        if (!event) return [];

        const similarEvents = await Event.find({ 
            _id: { $ne: event._id}, 
            tags: { $in: event.tags }  
        }).lean();

        return similarEvents;
    } catch (e) {
        return [];
    }
}