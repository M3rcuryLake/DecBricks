export interface ServiceItem {
  id: 'strategy' | 'creative' | 'web-development' | 'campaigns';
  number: string;
  eyebrow: string;
  title: string;
  navLabel: string;
  lead: string;
  body: string;
  capabilities: string[];
  videoSrc: string;
  projects: string[];
  /** Homepage service card preview copy & tag overrides (when homepage combines tags) */
  homeSummary: string;
  homeTags?: string[];
  homeExtraCount?: number;
}

export interface ClientLogo {
  id: number;
  name: string;
  alt: string;
  src: string;
  width: number;
  height: number;
}

export const SERVICES_HERO = {
  srTitle: 'Our Services',
  headingParts: ['Our', 'Services'] as const,
  body: 'An award-winning partner for games studios and publishers. We connect strategy, creative, web and campaigns to make you stand out and thrive.',
};

export const SERVICES: ServiceItem[] = [
  {
    id: 'strategy',
    number: '01',
    eyebrow: 'Planning',
    title: 'Strategy',
    navLabel: 'Strategy',
    lead: 'Clear evidence-based strategy built to find your audience, sharpen your positioning and plan for success.',
    body: 'It all starts with understanding who you are, what you stand for and where you want to go. Through workshops, research and insight, we build the foundations and a clear path forward for your brand, game, marketing or web.',
    capabilities: [
      'Research & Insight',
      'Workshops',
      'Brand Strategy',
      'Positioning',
      'Naming',
      'Tone of Voice',
      'Content Strategy',
      'Marketing Strategy',
      'Campaign & Messaging Strategy',
    ],
    videoSrc: '/videos/services/strategy.mp4',
    projects: ['AdHoc Studio', 'Companion Group', 'Oddiko', 'TTK', 'Blind Squirrel'],
    homeSummary:
      'Every brand, website and campaign we make starts with strategy. Strategy provides the foundation for your brand to establish the right plan forward to achieve the business objectives.',
  },
  {
    id: 'creative',
    number: '02',
    eyebrow: 'Making',
    title: 'Creative',
    navLabel: 'Creative',
    lead: 'Distinct award-winning creative that will set your digital and physical presence apart from the rest.',
    body: "Identities that define your story, intentionally crafted so they’re unmistakably yours. We deliver at any scale, from a single asset to full brand systems and campaign toolkits, and every project gets its own considered approach.",
    capabilities: [
      'Branding',
      'Motion',
      'Marketing Toolkits',
      'UX',
      'Wireframing',
      'UI',
      'Website & Ecommerce',
      'Platforms',
    ],
    videoSrc: '/videos/services/creative.mp4',
    projects: ['Bulkhead', 'Team17', 'Playground Games', 'Tencent', 'Jyamma Games', 'Dlala'],
    homeSummary:
      'From the identity that defines you to the creatives that carry it, our award-winning designs are crafted around your story and unmistakably yours.',
  },
  {
    id: 'web-development',
    number: '03',
    eyebrow: 'Building',
    title: 'Web Development',
    navLabel: 'Web Development',
    lead: 'Bespoke web platforms that are engineered to perform at scale.',
    body: 'We build web experiences from architecture to hosting, designed around the CMS and tools your team already utilises. Advanced engineering sits behind each platform, with UI and UX shaping every decision from the start.',
    capabilities: [
      'Technical Architecture',
      'Front-End Development',
      'Back-End Development',
      'CMS Development',
      'Ecommerce Development',
      'Newsletter & Mailing List Integrations',
      'Support Platform Integrations',
      'Careers Platform Integrations',
      'Hosting, Security & Maintenance',
    ],
    videoSrc: '/videos/services/web-development.mp4',
    projects: ['Riot', 'Microsoft', 'Forza', 'Evo.gg', 'Ninja Theory'],
    homeSummary:
      'Technically advanced web platforms where every detail is considered, built to perform at scale, drive player engagement and plug into the tools your team needs.',
    homeTags: [
      'Technical Architecture',
      'Hosting, Security & Maintenance',
      'Front & Back-End Development',
    ],
    homeExtraCount: 5,
  },
  {
    id: 'campaigns',
    number: '04',
    eyebrow: 'Pushing',
    title: 'Campaigns',
    navLabel: 'Campaign',
    lead: 'Marketing shaped around each campaign, reaching the right players, building momentum and turning interest into sales.',
    body: 'Campaigns and activations timed to the moments that matter, reaching your audience across organic, paid media and creators with one aligned strategy behind every channel.',
    capabilities: [
      'Marketing Strategy',
      'Go-to-Market Planning',
      'Key Beat Activations',
      'Store Page Audits and Testing',
      'Game Launches',
      'Organic',
      'Paid Media',
      'Creator Activations',
      'Social Assets',
      'Campaign Management',
    ],
    videoSrc: '/videos/services/campaigns.mp4',
    projects: ['Meadgard', 'Hell Let Loose', 'Temtem: Swarm', 'BapBap', 'Kyoryu', 'Alienware'],
    homeSummary:
      'Extra firepower for your launch. Crafting campaign activations that put your game in front of the right players at the right time.',
    homeTags: ['Paid Media', 'Key Beat Activations', 'Campaign Management'],
  },
];

const CLIENT_NAMES = [
  'AdHoc Studio',
  'Companion Group',
  'inXile Entertainment',
  'Play By Play Studios',
  'Hundred Star',
  'Third Kind Games',
  'Tripwire Interactive',
  'PlaySide Studios',
  '1047 Games',
  'TTK Games',
  'Bulkhead',
  'Crema',
  'Oddiko',
  'Riot Games',
  'Forza',
  'Compulsion Games',
  'Playground Games',
  'Marvelous Europe',
  'Nimble Giant Entertainment',
  'Tencent Games',
  'Team17',
  'Blind Squirrel Games',
  'Alienware',
  'Firaxis Games',
  'Jyamma Games',
  'Dlala Studios',
  'Ninja Theory',
  'CI Games',
  'Meadgard',
  'Hell Let Loose',
  'Xbox Game Studios',
  'BapBap',
  'Kyoryu',
];

// Original pool exactly as the CMS serves it (1minus1 logos ids 185–217, dump
// logos_list.json). Alt matches the original SSR `alt` (CMS file name sans .png).
const CLIENT_LOGO_SOURCES: Array<Pick<ClientLogo, 'id' | 'alt' | 'src' | 'width' | 'height'>> = [
  { id: 185, alt: "Layer_1", src: '/images/clients/client-01.png', width: 352, height: 288 },
  { id: 186, alt: "image 2", src: '/images/clients/client-02.png', width: 969, height: 531 },
  { id: 187, alt: "inXile_Logo2020_Capstone_white 1", src: '/images/clients/client-03.png', width: 655, height: 302 },
  { id: 188, alt: "PLayByPLay", src: '/images/clients/client-04.png', width: 792, height: 179 },
  { id: 189, alt: "HUNDREDSTAR", src: '/images/clients/client-05.png', width: 826, height: 125 },
  { id: 190, alt: "Third Kind white logo 1", src: '/images/clients/client-06.png', width: 916, height: 211 },
  { id: 191, alt: "Tripwire-Logo.e7575084 2", src: '/images/clients/client-07.png', width: 824, height: 234 },
  { id: 192, alt: "PlaySide_logo logo", src: '/images/clients/client-08.png', width: 1198, height: 360 },
  { id: 193, alt: "636d3f145b88e0cc89e6ab48_1047Logo_Color_Horiz_01x1000 1", src: '/images/clients/client-09.png', width: 659, height: 247 },
  { id: 194, alt: "TTK_Full_Logo_Black_LightBG_GAMES 1", src: '/images/clients/client-10.png', width: 639, height: 364 },
  { id: 195, alt: "Group-1", src: '/images/clients/client-11.png', width: 784, height: 285 },
  { id: 196, alt: "LogoCrema_Horizontal_4K_Invert-1024x576 1 1", src: '/images/clients/client-12.png', width: 677, height: 382 },
  { id: 197, alt: "Behold_Ventures_Portfolio_Oddiko 1", src: '/images/clients/client-13.png', width: 669, height: 669 },
  { id: 198, alt: "Group", src: '/images/clients/client-14.png', width: 753, height: 172 },
  { id: 199, alt: "Union-1", src: '/images/clients/client-15.png', width: 837, height: 242 },
  { id: 200, alt: "Compulsion_Games_Logo logo", src: '/images/clients/client-16.png', width: 728, height: 284 },
  { id: 201, alt: "Group 50897", src: '/images/clients/client-17.png', width: 835, height: 401 },
  { id: 202, alt: "marvelous-games-logo-transparent 1", src: '/images/clients/client-18.png', width: 567, height: 257 },
  { id: 203, alt: "Nimble_Giant_Entertainment_Logo logo", src: '/images/clients/client-19.png', width: 601, height: 364 },
  { id: 204, alt: "tencent logo", src: '/images/clients/client-20.png', width: 644, height: 115 },
  { id: 205, alt: "Team17_logo_(2018) logo", src: '/images/clients/client-21.png', width: 606, height: 157 },
  { id: 206, alt: "Layer_1-1", src: '/images/clients/client-22.png', width: 589, height: 369 },
  { id: 207, alt: "Nav", src: '/images/clients/client-23.png', width: 605, height: 182 },
  { id: 208, alt: "Firaxis_PrimaryLogo 1", src: '/images/clients/client-24.png', width: 1054, height: 199 },
  { id: 209, alt: "image 1", src: '/images/clients/client-25.png', width: 404, height: 295 },
  { id: 210, alt: "Group 139", src: '/images/clients/client-26.png', width: 321, height: 303 },
  { id: 211, alt: "Group 890", src: '/images/clients/client-27.png', width: 626, height: 291 },
  { id: 212, alt: "CI_Games 1", src: '/images/clients/client-28.png', width: 305, height: 373 },
  { id: 213, alt: "Layer_1-2", src: '/images/clients/client-29.png', width: 661, height: 309 },
  { id: 214, alt: "path823", src: '/images/clients/client-30.png', width: 487, height: 274 },
  { id: 215, alt: "xbox-game-studios logo", src: '/images/clients/client-31.png', width: 758, height: 436 },
  { id: 216, alt: "Union", src: '/images/clients/client-32.png', width: 353, height: 326 },
  { id: 217, alt: "logo-2.62d0d0dc 2", src: '/images/clients/client-33.png', width: 378, height: 409 },
];

export const CLIENT_LOGOS: ClientLogo[] = CLIENT_LOGO_SOURCES.map((source, idx) => ({
  ...source,
  name: CLIENT_NAMES[idx],
}));
