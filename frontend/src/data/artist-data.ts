export type ArtistEducation = {
  credential: string;
  institution: string;
  location: string;
  years: string;
};

export type ArtistExhibition = {
  year: number;
  title: string;
  venue: string;
  location: string;
  country: string;
};

export type ArtistSocials = {
  instagramHandle: string;
  instagramUrl: string;
  websiteLabel: string;
  websiteUrl: string;
};

export type ArtistAssets = {
  logo: string;
  logoWidth: number;
  logoHeight: number;
  portrait: string;
  portraitWidth: number;
  portraitHeight: number;
  atelier: string;
  atelierWidth: number;
  atelierHeight: number;
  studioVideo: string;
  studioVideoWidth: number;
  studioVideoHeight: number;
};

export type ArtistArchive = {
  name: string;
  honorificName: string;
  profession: string;
  disciplines: string;
  born: string;
  basedIn: string;
  nationality: string;
  languages: readonly string[];
  mediums: readonly string[];
  fields: readonly string[];
  profile: string;
  statement: string;
  philosophy: string;
  education: readonly ArtistEducation[];
  memberships: readonly string[];
  experience: string;
  soloExhibitions: readonly ArtistExhibition[];
  groupExhibitions: readonly ArtistExhibition[];
  internationalGroupExhibitions: readonly ArtistExhibition[];
  internationalPresentations: readonly string[];
  socials: ArtistSocials;
  assets: ArtistAssets;
};

export const artistAssets: ArtistAssets = {
  logo: '/newv/logo.jpg',
  logoWidth: 1080,
  logoHeight: 712,
  portrait: '/newv/IMG_20260913_131321_483.jpg',
  portraitWidth: 851,
  portraitHeight: 1280,
  atelier: '/newv/IMG_20260913_102917_796.jpg',
  atelierWidth: 3647,
  atelierHeight: 4863,
  studioVideo: '/newv/5852479938275320255.mp4',
  studioVideoWidth: 720,
  studioVideoHeight: 1280,
};

export const artist: ArtistArchive = {
  name: 'Parvaneh Razaghi',
  honorificName: 'Parvaneh Razaghi Art',
  profession: 'Painter',
  disciplines: 'Figurative & Contemporary Art',
  born: '1975, Tehran, Iran',
  basedIn: 'Tehran, Iran',
  nationality: 'Iranian',
  languages: ['Persian'],
  mediums: ['Oil painting', 'Mixed media'],
  fields: [
    'Figurative painting',
    'Contemporary art',
    'Portraiture',
    'Abstract & figurative expression',
  ],
  profile:
    'Parvaneh Razaghi is a professional Iranian painter whose practice moves between figurative and contemporary painting. Through a personal visual language she attends to the human figure, emotion, imagination, and the quiet psychology of a scene — often held in oil and mixed media, with an expressive, tactile surface.',
  statement:
    'Her canvases treat the figure as both presence and atmosphere: colour is allowed to breathe, texture is allowed to speak, and the sitter or imagined body is approached with stillness rather than spectacle.',
  philosophy:
    'The human figure, emotion, imagination, and psychological narrative — held in a personal visual language.',
  education: [
    {
      credential: 'Associate Degree in Painting',
      institution: 'Sooreh University',
      location: 'Tehran, Iran',
      years: '1995–1997',
    },
    {
      credential: 'Bachelor’s Degree in Graphic Design',
      institution: 'Islamic Azad University',
      location: 'Iran',
      years: '2011–2013',
    },
  ],
  memberships: ['Association of Painters of Iran'],
  experience:
    'Active in professional painting and exhibition practice since 2002, with solo and group presentations in Iran and internationally.',
  soloExhibitions: [
    {
      year: 2002,
      title: 'Solo Exhibition',
      venue: 'Naghsh Jahan Gallery',
      location: 'Tehran',
      country: 'Iran',
    },
    {
      year: 2004,
      title: 'Solo Exhibition',
      venue: 'Sheys Gallery',
      location: 'Iran',
      country: 'Iran',
    },
    {
      year: 2005,
      title: 'Solo Exhibition',
      venue: 'Banafsheh Gallery',
      location: 'Iran',
      country: 'Iran',
    },
    {
      year: 2006,
      title: 'Solo Exhibition',
      venue: 'Zangar Gallery',
      location: 'Iran',
      country: 'Iran',
    },
    {
      year: 2008,
      title: 'Solo Exhibition',
      venue: 'Seyhoon Gallery',
      location: 'Tehran',
      country: 'Iran',
    },
  ],
  groupExhibitions: [
    {
      year: 2002,
      title: 'Group Exhibition',
      venue: 'Naghsh Jahan Gallery',
      location: 'Iran',
      country: 'Iran',
    },
    {
      year: 2005,
      title: 'Group Exhibition',
      venue: 'Sheys Gallery',
      location: 'Iran',
      country: 'Iran',
    },
    {
      year: 2008,
      title: 'Pomegranate Festival — Selected Work of the Festival',
      venue: 'Pomegranate Festival',
      location: 'Iran',
      country: 'Iran',
    },
    {
      year: 2009,
      title: 'Fajr Visual Arts',
      venue: 'Museum of Contemporary Art',
      location: 'Iran',
      country: 'Iran',
    },
    {
      year: 2009,
      title: 'Ashoura Art',
      venue: 'Academy of Art',
      location: 'Iran',
      country: 'Iran',
    },
    {
      year: 2010,
      title: 'Group Exhibition',
      venue: 'Ministry of Foreign Affairs',
      location: 'Iran',
      country: 'Iran',
    },
    {
      year: 2010,
      title: 'China Expo',
      venue: 'China Expo',
      location: 'China',
      country: 'China',
    },
    {
      year: 2015,
      title: 'Group Exhibition',
      venue: 'Group Exhibition',
      location: 'Italy',
      country: 'Italy',
    },
    {
      year: 2015,
      title: 'Group Exhibition',
      venue: 'Group Exhibition',
      location: 'Switzerland',
      country: 'Switzerland',
    },
    {
      year: 2016,
      title: 'Time to Talk — UNESCO Workshop',
      venue: 'UNESCO',
      location: 'International',
      country: 'International',
    },
    {
      year: 2016,
      title: 'Group Exhibition',
      venue: 'Group Exhibition',
      location: 'Russia',
      country: 'Russia',
    },
    {
      year: 2017,
      title: 'Group Exhibition',
      venue: 'Group Exhibition',
      location: 'Portugal',
      country: 'Portugal',
    },
    {
      year: 2018,
      title: 'Paris Art Fair 3',
      venue: 'Paris Art Fair 3',
      location: 'Paris',
      country: 'France',
    },
    {
      year: 2020,
      title: 'Group Exhibition',
      venue: 'WEP Art Space',
      location: 'Iran',
      country: 'Iran',
    },
  ],
  internationalGroupExhibitions: [
    {
      year: 2010,
      title: 'China Expo',
      venue: 'China Expo',
      location: 'China',
      country: 'China',
    },
    {
      year: 2015,
      title: 'Group Exhibition',
      venue: 'Group Exhibition',
      location: 'Italy',
      country: 'Italy',
    },
    {
      year: 2015,
      title: 'Group Exhibition',
      venue: 'Group Exhibition',
      location: 'Switzerland',
      country: 'Switzerland',
    },
    {
      year: 2016,
      title: 'Group Exhibition',
      venue: 'Group Exhibition',
      location: 'Russia',
      country: 'Russia',
    },
    {
      year: 2017,
      title: 'Group Exhibition',
      venue: 'Group Exhibition',
      location: 'Portugal',
      country: 'Portugal',
    },
    {
      year: 2018,
      title: 'Paris Art Fair 3',
      venue: 'Paris Art Fair 3',
      location: 'Paris',
      country: 'France',
    },
  ],
  internationalPresentations: [
    'Switzerland',
    'Italy',
    'Russia',
    'Portugal',
    'France',
    'China',
  ],
  socials: {
    instagramHandle: 'parvane__razaghi',
    instagramUrl: 'https://instagram.com/parvane__razaghi',
    websiteLabel: 'parvanerazaghiart.com',
    websiteUrl: 'https://parvanerazaghiart.com',
  },
  assets: artistAssets,
};

export const publicPrimaryNav = [
  { href: '/', label: 'Home' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
] as const;

export const publicFooterNav = [
  { href: '/gallery', label: 'Gallery' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
  { href: '/login', label: 'Admin' },
] as const;
