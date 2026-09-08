import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { SITE } from '@/data/site';

interface FAQItem {
  q: string;
  a: string;
}

const faqs: FAQItem[] = [
  {
    q: 'Where is Unlimited Fun located?',
    a: `Unlimited Fun is located in ${SITE.city}, ${SITE.region}. You can find us on Google Maps using the "Get Directions" button in the Contact section.`,
  },
  {
    q: 'When are you open?',
    a: `We are open all days from ${SITE.hours}. ${SITE.workingDays}.`,
  },
  {
    q: 'What are your ticket prices?',
    a: 'Adults: 1 Hour for ₹500, 2 Hours for ₹850. Children: 1 Hour for ₹350, 2 Hours for ₹600. Visit the Prices section for details.',
  },
  {
    q: 'How long is each session?',
    a: 'You can choose between a 1-hour or 2-hour session for both adults and children.',
  },
  {
    q: 'What activities are available?',
    a: `We have ${SITE.activityCount} exciting activities including Indoor Climbing Wall, Main Trampoline Court, Trampoline Basketball, Sweeper, Hanging Tire Bridge, Ninja Warrior Rings, Foam Obstacles & Cylindrical Blocks, Triangle & Rectangle Foam Bridges, and Jumping Balloons. More activities will be announced soon.`,
  },
  {
    q: 'Can children participate?',
    a: "Yes, children can enjoy Unlimited Fun. We have dedicated children's pricing and activities suitable for younger visitors.",
  },
  {
    q: 'Can adults participate?',
    a: 'Yes, adults can enjoy all activities at Unlimited Fun. We welcome participants of all ages.',
  },
  {
    q: 'Is there a weight limit?',
    a: `Yes, participants must be below ${SITE.weightLimit}.`,
  },
  {
    q: 'How can I book a slot?',
    a: 'You can book your slot by filling out the booking form on this website. Go to the "Book Your Slot" section, enter your details, and our team will contact you to confirm.',
  },
  {
    q: 'What is the Instagram offer?',
    a: 'Follow our Instagram and get 50% off your second attempt. Offer subject to applicable park terms and verification.',
  },
  {
    q: 'Can I organize a birthday celebration?',
    a: 'Yes, Unlimited Fun can be positioned for birthday celebrations and group experiences. Use the "Enquire Now" button in the Birthday Parties section to submit your enquiry.',
  },
  {
    q: 'How can I contact Unlimited Fun?',
    a: `You can call us at ${SITE.phone}, email us at ${SITE.email}, or message us on WhatsApp at ${SITE.whatsapp}. Visit the Contact section for all options.`,
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="py-20 sm:py-28 bg-ink-950">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="inline-block text-sm font-bold text-volt-500 tracking-widest uppercase mb-3">
            FAQ
          </span>
          <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-white">
            FREQUENTLY ASKED <span className="text-volt-500">QUESTIONS</span>
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((item, i) => (
            <div
              key={i}
              className="rounded-xl bg-ink-900 border border-ink-800 overflow-hidden"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between gap-4 p-5 text-left"
              >
                <span className="font-semibold text-white text-sm sm:text-base">
                  {item.q}
                </span>
                <ChevronDown
                  className={`h-5 w-5 flex-shrink-0 text-volt-500 transition-transform ${
                    open === i ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {open === i && (
                <div className="px-5 pb-5 text-ink-300 text-sm leading-relaxed animate-fade-in">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
