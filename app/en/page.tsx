import type { Metadata } from "next";
import Image from "next/image";
import { CalendarDays, Heart, MoonStar, Scale, Sparkles } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { SectionHeading } from "@/components/SectionHeading";
import { Gallery } from "@/components/Gallery";
import { Footer } from "@/components/Footer";
import { MotionController } from "@/components/MotionController";
import { NeneAgeEnglish, NeneAgeHeadline, NeneAgeStats, NeneTotalDays } from "@/components/NeneAge";
import { ContactForm } from "@/components/ContactForm";
import { ShopPreview } from "@/components/ShopPreview";
import { baby, videos } from "@/data/nene";
import { getSiteContent } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Nene's Little World | Baby Memories",
  description: "Welcome to Nene's Little World—a lovingly curated collection of milestones, photographs, videos, and family memories.",
  alternates: { canonical: "/en", languages: { "th-TH": "/", en: "/en" } },
  openGraph: { locale: "en_US", title: "Nene's Little World", description: "A little place filled with Nene’s smiles, milestones, and love." },
};

const milestonesEn = [
  { date: "09 JUL", title: "Hello, World", description: "The day Nene was born and met this beautiful world for the very first time.", icon: "♡" },
  { date: "1 MONTH", title: "My First Month", description: "One month of growing, learning, and being surrounded by love every day.", icon: "✦" },
  { date: "GROWING", title: "I'm Growing!", description: "Getting stronger every day, with new expressions and tiny wonders to discover.", icon: "☁" },
];

const memoriesEn = [
  { icon: "🏠", title: "Our First Day Home", text: "Our home welcomed one very tiny and deeply loved new family member.", videoId: "first-day-home" },
  { icon: "☺", title: "The First Smile", text: "A tiny smile that made Mom and Dad’s hearts feel bigger than ever." },
  { icon: "🫧", title: "The First Bath", text: "A gentle, warm, and beautifully tender moment together." },
  { icon: "♡", title: "One Month Together", text: "A month of learning, growing, and falling more in love each day.", videoId: "one-month" },
  { icon: "🌙", title: "Cosy Little Nights", text: "Even on sleepless nights, every minute together has meaning." },
  { icon: "✦", title: "The Little Moments", text: "Every expression and tiny gesture becomes a memory to treasure." },
];

export default async function EnglishHome() {
  const [heroContent, galleryContent] = await Promise.all([getSiteContent("home_hero", "en"), getSiteContent("home_gallery", "th")]);
  const galleryPhotos = Array.isArray(galleryContent?.payload?.photos) ? galleryContent.payload.photos : undefined;
  return (
    <main>
      <MotionController /><Navbar locale="en" /><Hero locale="en" content={heroContent} /><ShopPreview locale="en" />
      <section className="profile section" id="about">
        <div className="profile-image"><div className="profile-frame"><Image src="/images/nene-joy.png" alt="Nene smiling brightly" fill sizes="(max-width: 760px) 90vw, 42vw" /></div><div className="profile-sticker">hello! <span>♡</span></div></div>
        <div className="profile-copy"><SectionHeading kicker="Meet our little sunshine" title="Hello, I'm Nene 👶🏻" align="left" /><p className="profile-lead">I may be just one tiny little girl,<br />but I have changed Mom and Dad’s whole world.</p><dl className="baby-facts">
          <div><dt><Heart size={18} /> Name</dt><dd>{baby.englishName} <span>({baby.thaiName})</span></dd></div><div><dt><CalendarDays size={18} /> Born</dt><dd>{baby.birthDateShort}</dd></div><div><dt><Scale size={18} /> Birth weight</dt><dd>{baby.birthWeight}</dd></div><div><dt><Sparkles size={18} /> Current age</dt><dd><NeneAgeEnglish /></dd></div><div><dt><MoonStar size={18} /> Current weight</dt><dd>Approximately 4 kg</dd></div>
        </dl></div>
      </section>
      <section className="milestones section section-soft" id="milestones"><SectionHeading kicker="Every little step matters" title="My Little Milestones" copy="Celebrating every tiny step that means the whole world to our family." /><div className="timeline">{milestonesEn.map((item, index) => <article className="timeline-card" key={item.title}><div className="timeline-icon">{item.icon}</div><p>{item.date}</p><h3>{item.title}</h3><span>{item.description}</span><b aria-hidden="true">0{index + 1}</b></article>)}</div></section>
      <section className="one-month section" aria-labelledby="one-month-title-en"><div className="one-month-photo"><Image src="/images/nene-one-month.jpeg" alt="Nene celebrating her first month" fill sizes="(max-width: 800px) 94vw, 52vw" /><span><NeneTotalDays suffix=" days with you ♡" /></span></div><div className="one-month-copy"><p className="eyebrow">Our current little chapter</p><h2 id="one-month-title-en"><NeneAgeHeadline /><br /><em>OF LOVE</em></h2><NeneAgeStats locale="en" /><p className="english-quote">“<NeneTotalDays suffix=" days" /> of tiny smiles, little cries, sleepless nights and endless love.”</p><p>Every little smile, sleepy cuddle, and new discovery adds another beautiful page to our family’s story.</p></div></section>
      <section className="gallery section" id="gallery"><SectionHeading kicker="Our favourite tiny moments" title="Little Moments 📸" copy="Everyday photographs that have become some of our most precious memories." /><Gallery locale="en" items={galleryPhotos} /></section>
      <section className="video-memories section section-soft" aria-labelledby="video-title-en"><SectionHeading kicker="Press play, keep forever" title="Moving Memories" copy="Some memories are most beautiful when we can watch them come alive again." /><div className="video-grid">{videos.map((video) => <article key={video.src} id={`video-${video.id}`}><video controls playsInline preload="metadata" poster={video.poster} aria-label={video.subtitle}><source src={video.src} type="video/mp4" /><track kind="captions" src="/captions/nene-th.vtt" srcLang="th" label="Thai captions" /></video><div><span>{video.id === "first-day-home" ? "A brand-new chapter begins" : "One month of love"}</span><h3>{video.subtitle}</h3></div></article>)}</div></section>
      <section className="memories section" id="memories"><SectionHeading kicker="Small stories, big love" title="Sweet Memories" copy="Little stories we hope to read together with Nene in the years ahead." /><div className="memory-grid">{memoriesEn.map((memory, index) => <article className="memory-card" key={memory.title}><span className="memory-number">{String(index + 1).padStart(2, "0")}</span><div className="memory-icon">{memory.icon}</div><h3>{memory.title}</h3><p>{memory.text}</p>{memory.videoId && <a className="memory-video-link" href={`#video-${memory.videoId}`}>Watch this memory <span aria-hidden="true">→</span></a>}</article>)}</div></section>
      <section className="letter section" aria-labelledby="letter-title-en"><div className="letter-photo"><Image src="/images/nene-smile.jpeg" alt="Nene's sweet little smile" fill sizes="(max-width: 760px) 88vw, 38vw" /></div><article className="letter-paper"><span className="letter-mark">♡</span><p className="eyebrow">Forever in our hearts</p><h2 id="letter-title-en">A Letter From<br /><em>Mom & Dad</em></h2><div className="letter-content"><p>Dear Nene,</p><p>From the moment you came into our lives, our whole world changed. Every day carries more meaning now. Your little smile fills us with happiness, and we promise to stand beside you through every chapter of your life.</p><p>We love you more than words can say.<br /><b>Mom & Dad ♡</b></p></div></article></section>
      <ContactForm locale="en" /><Footer locale="en" />
    </main>
  );
}
