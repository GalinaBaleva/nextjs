import Image from "next/image";
import { notFound } from "next/navigation";    
import { getEventBySlug } from "@/lib/actions/event.actions";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

const EventDetailItem = ({ icon, alt, label }: { icon: string; alt: string; label: string }) => (
    <div className="flex-row-gap-2 items-center">
        <Image src={icon} alt={alt} width={17} height={17} />
        <p>{label}</p>
    </div>
);

const EventAgenda = ({ agendaItems }: { agendaItems: string[] }) => (
    <div className="agenda">
        <h2>Agenda</h2>
        <ul>
            {agendaItems.map((item) => (
                <li key={item}>{item}</li>
            ))}
        </ul>
    </div>
);

const EventTag = ({ tag }: { tag: string[] }) => (
    <div className="flex flex-row gap-1.5 flex-wrap">
        {tag.map((tag) => (
            <div className="pill" key={tag}>{tag}</div>
        ))}
    </div>
)

const EventDetailPage = async ({ params }: { params: Promise<{ slug: string }> }) => {

    const { slug } = await params;

    const event = await getEventBySlug(slug);
    if(!event) return notFound();

   const { description, image, overview, date, time, location, mode, agenda, audience, tags, organizer } = event;

    return (
        <section id="event">
            <div className="header">
                <h1>Event Detail</h1>
                <p >{description}</p>
            </div>
            <div className="details">
                {/* Left Side - Event Content*/}
                <div className="content">
                    <Image src={image} alt="Event Banner" width={800} height={800} className="banner" />
                    <section className="flex-col-gap-2">
                        <h2>Overview</h2>
                        <p>{overview}</p>
                    </section>

                    <section className="flex-col-gap-2">
                        <h2>Event Details</h2>

                        <EventDetailItem icon="/icons/calendar.svg" alt="calendar" label={date} />
                        <EventDetailItem icon="/icons/clock.svg" alt="clock" label={time} />
                        <EventDetailItem icon="/icons/pin.svg" alt="pin" label={location} />
                        <EventDetailItem icon="/icons/mode.svg" alt="mode" label={mode} />
                        <EventDetailItem icon="/icons/audience.svg" alt="audience" label={audience} />
                    </section>

                    <EventAgenda agendaItems={agenda} />

                    <section className="flex-col-gap-2">
                        <h2>Organizer</h2>
                        <p>{organizer}</p>
                    </section>

                    <EventTag tag={tags} />
                </div>

                {/* Right Side - Booking Form */}
                <aside className="booking">
                    <p className="text-lg font-semibold">Book Event</p>
                </aside>
            </div>
        </section>
    );
}

export default EventDetailPage;