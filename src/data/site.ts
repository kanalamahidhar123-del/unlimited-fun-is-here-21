export const SITE = {
  name: 'UNLIMITED FUN',
  handle: '@unlimited_fun_is_here',
  city: 'Bhimavaram',
  region: 'Andhra Pradesh, India',
  phone: '9059058449',
  phoneDisplay: '9059058449',
  whatsapp: '9059058449',
  email: 'balachandraya.group@gmail.com',
  instagram:
    'https://www.instagram.com/unlimited_fun_is_here?stkn=dmZtYWR0dnJuOXFr',
  maps: 'https://maps.app.goo.gl/oP2K9FeRB33y2WAZ9?g_st=ac',
  mapsEmbed:
    'https://www.google.com/maps?q=Bhimavaram,Andhra%20Pradesh,India&output=embed',
  googleSheetUrl:
    import.meta.env.VITE_GOOGLE_SHEET_URL ||
    'https://script.google.com/macros/s/AKfycbwRudFGvsePk-DCNfdA93HCw3-Mh7tDqz2Sxrol8fN1VEy3R8He-5xQw12pVpE3QXRbfQ/exec',
  openingDate: '2026-09-12',
  openingTime: '12:00 PM',
  hours: '9:00 AM – 10:00 PM',
  hoursShort: '9 AM – 10 PM',
  workingDays: 'Open All Days',
  activityCount: 13,
  weightLimit: '120 kg',
  pricing: {
    trampolinePark: {
      title: 'TRAMPOLINE PARK',
      icon: '🏃',
      eligibility: '5 years above OR 2.5 feet above',
      tiers: [
        { duration: '30 Minutes', price: 300 },
        { duration: '1 Hour', price: 500 },
        { duration: '2 Hours', price: 850, highlight: true },
        { duration: '3 Hours', price: 1100 },
      ],
    },
    softPlay: {
      title: 'SOFT PLAY',
      icon: '🧸',
      eligibility: '5 years below OR 2.5 feet below',
      tiers: [
        { duration: '30 Minutes', price: 200 },
        { duration: '1 Hour', price: 350 },
        { duration: '2 Hours', price: 600 },
        { duration: '3 Hours', price: 800 },
      ],
    },
    rfidCards: {
      title: 'RFID CARDS',
      icon: '💳',
      tiers: [
        { name: 'Basic', price: 100 },
        { name: 'Premium', price: 500 },
      ],
    },
  },
};

export const NAV_LINKS = [
  { label: 'HOME', href: '#home' },
  { label: 'GAMES', href: '#games' },
  { label: 'PRICES', href: '#pricing' },
  { label: 'RFID CARDS', href: '#rfid-cards' },
  { label: 'OFFERS', href: '#offers' },
  { label: 'BOOKING', href: '#booking' },
  { label: 'STATUS', href: '#booking' },
  { label: 'ABOUT', href: '#about' },
  { label: 'BIRTHDAY', href: '#birthday' },
  { label: 'GALLERY', href: '#gallery' },
  { label: 'FAQ', href: '#faq' },
  { label: 'CONTACT', href: '#contact' },
];
