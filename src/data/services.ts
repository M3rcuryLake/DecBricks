import type { ImageMetadata } from 'astro';
import strategyConsultingPic from '../assets/services/Strategy_Consulting.png';
import designBrandingPic from '../assets/services/Design_Branding.png';
import webSoftwarePic from '../assets/services/Web_n_Software_Development.png';
import mobileAppPic from '../assets/services/Mobile_App_Development.png';
import aiAutomationPic from '../assets/services/AI_Automation.png';
import digitalMarketingPic from '../assets/services/Digital_Marketing_n_Growth.png';
import businessOutreachPic from '../assets/services/Business_Development_n_Outreach.png';

export type ServiceId =
  | 'strategy-consulting'
  | 'design-branding'
  | 'web-software-development'
  | 'mobile-app-development'
  | 'ai-automation'
  | 'digital-marketing-growth'
  | 'business-development-outreach';

export type ServiceMedia =
  | { kind: 'artwork'; motif: ServiceId; alt: string; code: string }
  | { kind: 'image'; src: ImageMetadata; alt: string; position?: string }
  | { kind: 'video'; src: string; poster: string; alt: string };

export interface ServiceItem {
  id: ServiceId;
  number: string;
  eyebrow: string;
  title: string;
  navLabel: string;
  lead: string;
  paragraphs: string[];
  capabilities: string[];
  media: ServiceMedia;
  /** Homepage service card preview copy & tag overrides */
  homeSummary: string;
  homeTags: string[];
  homeExtraCount?: number;
  /** Empty/omitted until real Decbricks project case studies exist (open-items A14) */
  projects?: string[];
}

export interface ClientLogo {
  id: number;
  name: string;
  alt: string;
  src: string;
  width: number;
  height: number;
}

export const SERVICES_SECTION_HEADER = {
  displayTitle: 'OUR EXPERTISE',
  eyebrow: 'WHAT WE DO',
  heading: 'Complete digital solutions. One trusted partner.',
  intro:
    'We bring together technology, design and business growth expertise to help companies build stronger digital foundations and create new opportunities.',
  ctaLabel: 'Explore All Services',
  ctaHref: '/services',
} as const;

export const SERVICES_HERO = {
  srTitle: 'Our Expertise',
  headingParts: ['Our', 'Expertise'] as const,
  body: SERVICES_SECTION_HEADER.intro,
};

export const SERVICES: ServiceItem[] = [
  {
    id: 'strategy-consulting',
    number: '01',
    eyebrow: 'STRATEGY',
    title: 'Strategy & Consulting',
    navLabel: 'Strategy',
    lead: 'A clear direction for every big idea.',
    paragraphs: [
      'We help businesses identify opportunities, define product requirements and choose the right technology and strategies to achieve their objectives.',
    ],
    capabilities: [
      'Technology Consulting',
      'Digital Strategy',
      'Product Planning',
      'Business Process Analysis',
      'Technical Architecture',
      'Market Research',
      'Product Roadmapping',
    ],
    media: {
      kind: 'image',
      src: strategyConsultingPic,
      alt: 'Halftone illustration of two hands moving chess pieces across a board on an amber ground.',
      position: '50% 50%',
    },
    homeSummary:
      'We help businesses identify opportunities, define product requirements and choose the right technology and strategies to achieve their objectives.',
    homeTags: ['Technology Consulting', 'Digital Strategy', 'Product Planning'],
  },
  {
    id: 'design-branding',
    number: '02',
    eyebrow: 'DESIGN',
    title: 'Design & Branding',
    navLabel: 'Design',
    lead: 'Make your brand impossible to overlook.',
    paragraphs: [
      'We create thoughtful digital experiences and distinctive brand identities that communicate your value, strengthen your presence and connect with your audience.',
    ],
    capabilities: [
      'Brand Identity & Logo Design',
      'UI/UX Design',
      'Website Design',
      'Application Interface Design',
      'Graphic & Creative Design',
      'Social Media Creatives',
      'Marketing Materials',
    ],
    media: {
      kind: 'image',
      src: designBrandingPic,
      alt: 'Halftone grid of brand guideline, colour palette, and typography specimen spreads.',
      position: '50% 50%',
    },
    homeSummary:
      'We create thoughtful digital experiences and distinctive brand identities that communicate your value, strengthen your presence and connect with your audience.',
    homeTags: ['UI/UX Design', 'Website Design', 'Marketing Materials'],
  },
  {
    id: 'web-software-development',
    number: '03',
    eyebrow: 'ENGINEERING',
    title: 'Web & Software Development',
    navLabel: 'Web & Software',
    lead: 'Powerful digital products, built for real-world needs.',
    paragraphs: [
      'We develop modern websites, web applications and customised software that help businesses improve operations, serve customers and scale confidently.',
    ],
    capabilities: [
      'Website Development',
      'Web Application Development',
      'E-commerce Development',
      'Custom Software Development',
      'Frontend & Backend Development',
      'SaaS Development',
      'API Development',
      'Website Maintenance',
    ],
    media: {
      kind: 'image',
      src: webSoftwarePic,
      alt: 'Halftone side-profile portrait with a pixel-stepped interface gradient bar.',
      position: '50% 42%',
    },
    homeSummary:
      'We develop modern websites, web applications and customised software that help businesses improve operations, serve customers and scale confidently.',
    homeTags: ['Website Development', 'SaaS Development', 'API Development'],
  },
  {
    id: 'mobile-app-development',
    number: '04',
    eyebrow: 'MOBILE',
    title: 'Mobile App Development',
    navLabel: 'Mobile Apps',
    lead: 'Your business, within reach.',
    paragraphs: [
      'We build intuitive and scalable mobile applications designed to deliver seamless user experiences and support your business objectives.',
    ],
    capabilities: [
      'Android App Development',
      'iOS App Development',
      'Cross-Platform App Development',
      'Mobile UI/UX Design',
      'Backend Development',
      'API Integration',
      'App Maintenance & Support',
    ],
    media: {
      kind: 'image',
      src: mobileAppPic,
      alt: 'Halftone artwork displaying two mobile application interface screens side by side.',
      position: '50% 50%',
    },
    homeSummary:
      'We build intuitive and scalable mobile applications designed to deliver seamless user experiences and support your business objectives.',
    homeTags: ['Android App Development', 'iOS App Development', 'Mobile UI/UX Design'],
  },
  {
    id: 'ai-automation',
    number: '05',
    eyebrow: 'INTELLIGENCE',
    title: 'AI & Automation',
    navLabel: 'AI & Automation',
    lead: 'Make technology work smarter.',
    paragraphs: [
      'We help businesses use artificial intelligence and automation to streamline workflows, improve efficiency and unlock new possibilities.',
    ],
    capabilities: [
      'AI Agent Development',
      'AI Chatbot Development',
      'Generative AI Integration',
      'Business Process Automation',
      'Workflow Automation',
      'AI-Powered Applications',
      'LLM Integration',
      'Intelligent Business Systems',
    ],
    media: {
      kind: 'image',
      src: aiAutomationPic,
      alt: 'Halftone circuit and cable assembly overlaid with dashed coordinate telemetry lines.',
      position: '50% 50%',
    },
    homeSummary:
      'We help businesses use artificial intelligence and automation to streamline workflows, improve efficiency and unlock new possibilities.',
    homeTags: ['AI Agent Development', 'LLM Integration', 'Workflow Automation'],
  },
  {
    id: 'digital-marketing-growth',
    number: '06',
    eyebrow: 'GROWTH',
    title: 'Digital Marketing & Growth',
    navLabel: 'Growth',
    lead: 'Get noticed. Reach further. Grow faster.',
    paragraphs: [
      'We help businesses strengthen their online presence, connect with potential customers and build digital marketing strategies focused on meaningful growth.',
    ],
    capabilities: [
      'Search Engine Optimisation (SEO)',
      'Social Media Marketing',
      'Social Media Management',
      'Performance Marketing',
      'Content Marketing',
      'Paid Advertising',
      'Email Marketing',
      'Lead Generation',
    ],
    media: {
      kind: 'image',
      src: digitalMarketingPic,
      alt: 'Halftone print showing hands holding a folded coral and charcoal graphic sheet.',
      position: '50% 50%',
    },
    homeSummary:
      'We help businesses strengthen their online presence, connect with potential customers and build digital marketing strategies focused on meaningful growth.',
    homeTags: ['Search Engine Optimisation (SEO)', 'Lead Generation', 'Paid Advertising'],
  },
  {
    id: 'business-development-outreach',
    number: '07',
    eyebrow: 'OUTREACH',
    title: 'Business Development & Outreach',
    navLabel: 'Outreach',
    lead: 'Create connections that move business forward.',
    paragraphs: [
      'Business growth takes more than having a great product or service. It requires reaching the right audience, starting meaningful conversations and building relationships.',
      'At Decbricks, we help businesses identify potential customers and develop structured outreach campaigns. Our experience includes executing email and cold-calling campaigns for startups such as Findtern and Upcoming Engineers.',
      'From prospect research to campaign execution and follow-ups, we help businesses create new opportunities and strengthen their outreach efforts.',
    ],
    capabilities: [
      'B2B Lead Generation',
      'LinkedIn Outreach',
      'Cold Email Campaigns',
      'Cold Calling Campaigns',
      'Prospect Research',
      'Email Campaign Management',
      'Sales Development Support',
      'Client Acquisition Support',
    ],
    media: {
      kind: 'image',
      src: businessOutreachPic,
      alt: 'Halftone low-angle photograph of a group reaching hands together in a circle.',
      position: '50% 50%',
    },
    homeSummary:
      'Business growth takes more than having a great product or service. It requires reaching the right audience, starting meaningful conversations and building relationships.',
    homeTags: ['B2B Lead Generation', 'LinkedIn Outreach', 'Cold Email Campaigns'],
  },
];

// Cleared of 1minus1 studio logos until real Decbricks client logos & permissions exist (open-items A14 / B2).
export const CLIENT_LOGOS: ClientLogo[] = [];
