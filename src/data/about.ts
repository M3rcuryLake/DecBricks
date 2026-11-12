/**
 * About page content — VERBATIM from docs/about-section-data.md.
 * Do not rewrite, trim or re-punctuate (AGENTS.md rule 5).
 */

import type { ImageMetadata } from 'astro';
import rocket from '../assets/about/rocket.webp';
import poster from '../assets/about/poster.webp';
import horse from '../assets/about/horse.webp';
import airstrip from '../assets/about/airstrip.webp';
import bust from '../assets/about/bust.webp';
import knight from '../assets/about/knight.webp';
import rocketposter from '../assets/about/rocketposter.webp';

export interface AboutValue {
  name: string;
  text: string;
}

export interface AboutSection {
  id: string;
  /** Giant ghost numeral, "01"–"07". */
  number: string;
  /** Short uppercase eyebrow + sidebar label (template uppercases). */
  eyebrow: string;
  navLabel: string;
  title: string;
  paragraphs: string[];
  values?: AboutValue[];
  /** Optional bold closing line (Philosophy). */
  closing?: string;
  /** Optional media card beside the block (mirrors ServiceBlock's video column;
   *  see docs/plans/about-pictures-plan.md — all seven sections carry one). */
  image?: { src: ImageMetadata; alt: string; position?: string };
}

export const ABOUT: AboutSection[] = [
  {
    id: "who-we-are",
    number: "01",
    eyebrow: "Who We Are",
    navLabel: "Who We Are",
    title: "Building Technology. Empowering Businesses. Driving Growth.",
    paragraphs: [
      "We partner with startups, emerging businesses, agencies, and established organisations across India and international markets to solve real-world business challenges through technology, innovation, and strategic execution.",
      "Our capabilities span custom software development, web and mobile application development, artificial intelligence (AI), business automation, UI/UX and digital design, digital marketing, and business development. Whether it's building a new digital product, streamlining business operations, strengthening an online presence, or reaching the right audience, we bring together the technical expertise and creative execution required to take businesses forward.",
      "At Decbricks, we believe technology should serve a purpose. Every solution we build is driven by the goal of creating measurable value, improving user experiences, optimising processes, and unlocking new opportunities for business growth.",
    ],
    image: {
      src: rocketposter,
      alt: "Retro rocket poster with pixel-dot typography and a coral 100% statistic on a charcoal ground.",
    },
  },
  {
    id: "what-drives-us",
    number: "02",
    eyebrow: "Driven",
    navLabel: "What Drives Us",
    title: "What Drives Us",
    image: {
      src: horse,
      alt: "Red print-style artwork of wild horses surging above a small city skyline.",
    },
    paragraphs: [
      "We are driven by the challenge of solving meaningful problems through technology and creative thinking. Every business operates differently, with its own objectives, challenges, and opportunities. That's why we approach every project with a focus on understanding the bigger picture before defining the right solution.",
      "By combining practical problem-solving, modern technologies, creative innovation, and consistent execution, we aim to deliver digital solutions that address real needs and create lasting impact. Our approach is built around turning complex challenges into practical opportunities for businesses to innovate, adapt, and grow.",
    ],
  },
  {
    id: "mission",
    number: "03",
    eyebrow: "Mission",
    navLabel: "Mission",
    title: "Our Mission",
    image: {
      src: rocket,
      alt: "Rocket lifting off over coastal wetlands, seen from above in a halftone print style.",
    },
    paragraphs: [
      "Our mission is to empower businesses with accessible, innovative, and effective technology solutions that simplify operations, enhance digital experiences, and accelerate sustainable growth. We strive to bridge the gap between ideas and execution by making modern digital capabilities more accessible to businesses of every scale.",
    ],
  },
  {
    id: "vision",
    number: "04",
    eyebrow: "Vision",
    navLabel: "Vision",
    title: "Our Vision",
    image: {
      src: poster,
      alt: "Retro typography poster collage mixing halftone portraits, liquid lettering and experimental colour.",
      // Poster is 0.707 wide of the 4:5 box: crop the sides, keep the middle band.
      position: "50% 50%",
    },
    paragraphs: [
      "Our vision is to become a trusted global technology and digital solutions partner, working alongside businesses to navigate digital transformation, embrace emerging technologies, and unlock new possibilities. We aspire to build an ecosystem where innovation, technology, and strategic thinking enable organisations to adapt, compete, and thrive in an increasingly connected world.",
    ],
  },
  {
    id: "values",
    number: "05",
    eyebrow: "Values",
    navLabel: "Values",
    title: "Our Values",
    paragraphs: [
      "The way we approach technology, collaboration, and business growth is shaped by five core principles.",
    ],
    image: {
      src: knight,
      alt: "Halftone artwork of a chess knight helmet with coral brush strokes on a charcoal ground.",
    },
    values: [
      {
        name: "Innovation",
        text: "We continuously explore emerging technologies, fresh perspectives, and better approaches to solving problems. We believe innovation comes from challenging conventional thinking and finding more effective ways to create value.",
      },
      {
        name: "Commitment",
        text: "We take ownership of our work, value the trust our clients place in us, and remain accountable throughout the execution process. Every project deserves attention, consistency, and a commitment to delivering meaningful outcomes.",
      },
      {
        name: "Collaboration",
        text: "We believe strong partnerships produce stronger solutions. Through open communication, shared understanding, and active collaboration, we work closely with clients to align our efforts with their goals.",
      },
      {
        name: "Quality",
        text: "We prioritise reliability, functionality, performance, and thoughtful design. From the initial concept to the final implementation, we focus on delivering solutions that meet high standards and create dependable digital experiences.",
      },
      {
        name: "Growth",
        text: "We embrace continuous learning and improvement. Whether it's adopting new technologies, refining our processes, or expanding our capabilities, we believe growth is essential to creating long-term value for our clients and our organisation.",
      },
    ],
  },
  {
    id: "experience",
    number: "06",
    eyebrow: "Experience",
    navLabel: "Experience",
    title: "Our Experience",
    image: {
      src: airstrip,
      alt: "Aerial survey view of an airbase with jet shadows and coordinate markings along the edges.",
    },
    paragraphs: [
      "Our experience extends beyond technology development into the practical execution of business growth initiatives. We understand that building a successful digital product or business requires more than strong technology. It also requires effective communication, market understanding, and the ability to connect with the right audience.",
      "Alongside developing digital solutions, we have executed email outreach and cold-calling campaigns for startups, including Findtern and Upcoming Engineers. These engagements have provided practical experience in prospect research, targeted lead generation, business communication, customer outreach, and consistent campaign execution. This combination of technical development and business-facing execution gives us a broader perspective on the challenges businesses encounter as they build, launch, and scale.",
    ],
  },
  {
    id: "philosophy",
    number: "07",
    eyebrow: "Philosophy",
    navLabel: "Philosophy",
    title: "Our Philosophy",
    image: {
      src: bust,
      alt: "Classical marble bust rendered in beige halftone dots against a charcoal ground.",
      // Bust is 0.562 wide of the 4:5 box: crop top/bottom, keep the face band.
      position: "50% 40%",
    },
    paragraphs: [
      "We don't build technology simply because it's possible. We build it because it serves a purpose. Every project begins with understanding the problem, identifying the intended outcome, and choosing an approach that aligns with the business objectives behind it.",
      "We value thoughtful engineering, purposeful design, and execution that prioritises real-world impact. Whether developing software, implementing AI-powered solutions, automating workflows, or supporting digital growth, our focus remains on creating solutions that are practical, scalable, and built to deliver lasting value.",
    ],
    closing: "Decbricks. Building ideas into reality.",
  },
];
