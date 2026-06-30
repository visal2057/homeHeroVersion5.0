export const SERVICE_CATEGORIES = [
  {
    code: 'GARDENING',
    name: 'Gardening',
    slug: 'gardening',
    description: 'Lawn mowing, pruning, planting and garden maintenance.',
    icon: 'leaf',
    image: 'https://images.unsplash.com/photo-1650216600469-bb05741a636f?auto=format&fit=crop&w=900&q=80',
  },
  {
    code: 'CLEANING',
    name: 'Cleaning',
    slug: 'cleaning',
    description: 'Home and office deep cleaning services.',
    icon: 'sparkle',
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=80',
  },
  {
    code: 'PET_CARE',
    name: 'Pet Care',
    slug: 'pet-care',
    description: 'Pet grooming, sitting and walking services.',
    icon: 'paw',
    image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=900&q=80',
  },
  {
    code: 'PLUMBING',
    name: 'Plumbing',
    slug: 'plumbing',
    description: 'Pipe repairs, installations and leak fixes.',
    icon: 'wrench',
    image: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&w=900&q=80',
  },
  {
    code: 'AC_REPAIR',
    name: 'AC Repair',
    slug: 'ac-repair',
    description: 'Air conditioner servicing and repairs.',
    icon: 'snowflake',
    image: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&w=900&q=80',
  },
];

/* Full-resolution hero background, separate from the service tile images
   above since it needs to be a wide landscape shot rather than a square
   crop. */
export const HERO_IMAGE_URL =
  'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=2000&q=80';

/* Floating hero collage photos - intentionally different from the service
   category images above and from each other, so no photo repeats anywhere
   on the homepage. */
export const HERO_VISUAL_PHOTOS = [
  {
    url: 'https://images.unsplash.com/photo-1758687126864-96b61e1b3af0?auto=format&fit=crop&w=700&q=80',
    alt: 'A gardener tending to plants in a home garden',
  },
  {
    url: 'https://images.unsplash.com/photo-1686890121534-ddf6ea532c72?auto=format&fit=crop&w=700&q=80',
    alt: 'A happy Labrador relaxing outdoors',
  },
  {
    url: 'https://images.unsplash.com/photo-1668189777890-495c36095340?auto=format&fit=crop&w=700&q=80',
    alt: 'A smiling HomeHero technician',
  },
];

/* "Ready to feel at home again" collage photos - deliberately different
   from both the service category images and the hero collage above, so
   every photo on the homepage is unique. */
export const CTA_COLLAGE_PHOTOS = [
  'https://images.unsplash.com/photo-1744454242792-35fe6f8bdaa4?auto=format&fit=crop&w=700&q=80',
  'https://images.unsplash.com/photo-1686178827149-6d55c72d81df?auto=format&fit=crop&w=700&q=80',
  'https://images.unsplash.com/photo-1594989627219-01e365ee6d05?auto=format&fit=crop&w=700&q=80',
  'https://images.unsplash.com/photo-1676210134188-4c05dd172f89?auto=format&fit=crop&w=700&q=80',
  'https://images.unsplash.com/photo-1642749776312-aa42ce20c9f5?auto=format&fit=crop&w=700&q=80',
];
