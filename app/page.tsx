import Image from "next/image";
import { CalendarDays, Heart, MoonStar, Scale, Sparkles } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { SectionHeading } from "@/components/SectionHeading";
import { Gallery } from "@/components/Gallery";
import { Footer } from "@/components/Footer";
import { MotionController } from "@/components/MotionController";
import { NeneAgeHeadline, NeneAgeStats, NeneAgeThai, NeneTotalDays } from "@/components/NeneAge";
import { ContactForm } from "@/components/ContactForm";
import { ShopPreview } from "@/components/ShopPreview";
import { baby, memories, milestones, videos } from "@/data/nene";
import { getSiteContent } from "@/lib/catalog";

export default async function Home() {
  const [heroContent, profileContent, chapterContent, letterContent, galleryContent] = await Promise.all([
    getSiteContent("home_hero", "th"), getSiteContent("home_profile", "th"),
    getSiteContent("home_chapter", "th"), getSiteContent("home_letter", "th"), getSiteContent("home_gallery", "th"),
  ]);
  const galleryPhotos = Array.isArray(galleryContent?.payload?.photos) ? galleryContent.payload.photos : undefined;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://nenes-little-world.vercel.app";
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Nene's Little World",
    alternateName: ["เนเน่ ตัวจิ๋ว", "เนเน่ตัวจิ๋ว", "เว็บไซต์น้องเนเน่"],
    url: siteUrl,
    inLanguage: "th-TH",
    description: "เรื่องราว พัฒนาการ และการผจญภัยเล็ก ๆ ของเนเน่ ตัวจิ๋ว",
  };
  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
      <MotionController />
      <Navbar />
      <Hero content={heroContent} />
      <ShopPreview />

      <section className="profile section" id="about">
        <div className="profile-image">
          <div className="profile-frame">
            <Image src={typeof profileContent?.payload?.image_url === "string" ? profileContent.payload.image_url : "/images/nene-joy.png"} alt="น้องเนเน่ยิ้มสดใส" fill sizes="(max-width: 760px) 90vw, 42vw" unoptimized={typeof profileContent?.payload?.image_url === "string"} />
          </div>
          <div className="profile-sticker">hello! <span>♡</span></div>
        </div>
        <div className="profile-copy">
          <SectionHeading kicker="Meet our little sunshine" title="Hello, I'm Nene 👶🏻" align="left" />
          <p className="profile-lead">หนูอาจจะเป็นเพียงเด็กตัวเล็ก ๆ คนหนึ่ง<br />แต่หนูทำให้โลกของพ่อกับแม่เปลี่ยนไปทั้งใบ</p>
          <dl className="baby-facts">
            <div><dt><Heart size={18} /> ชื่อ</dt><dd>{baby.thaiName} <span>({baby.englishName})</span></dd></div>
            <div><dt><CalendarDays size={18} /> วันเกิด</dt><dd>{baby.birthDate}</dd></div>
            <div><dt><Scale size={18} /> น้ำหนักแรกเกิด</dt><dd>{baby.birthWeight}</dd></div>
            <div><dt><Sparkles size={18} /> อายุปัจจุบัน</dt><dd><NeneAgeThai /></dd></div>
            <div><dt><MoonStar size={18} /> น้ำหนักปัจจุบัน</dt><dd>{baby.currentWeight}</dd></div>
          </dl>
        </div>
      </section>

      <section className="milestones section section-soft" id="milestones">
        <SectionHeading kicker="Every little step matters" title="My Little Milestones" copy="บันทึกทุกก้าวเล็ก ๆ ที่มีความหมายมหาศาลในหัวใจของเรา" />
        <div className="timeline">
          {milestones.map((milestone, index) => (
            <article className="timeline-card" key={milestone.title}>
              <div className="timeline-icon">{milestone.icon}</div>
              <p>{milestone.date}</p>
              <h3>{milestone.title}</h3>
              <span>{milestone.description}</span>
              <b aria-hidden="true">0{index + 1}</b>
            </article>
          ))}
        </div>
      </section>

      <section className="one-month section" aria-labelledby="one-month-title">
        <div className="one-month-photo">
          <Image src={typeof chapterContent?.payload?.image_url === "string" ? chapterContent.payload.image_url : "/images/nene-one-month.jpeg"} alt="เนเน่ในบทปัจจุบัน" fill sizes="(max-width: 800px) 94vw, 52vw" unoptimized={typeof chapterContent?.payload?.image_url === "string"} />
          <span><NeneTotalDays suffix=" days with you ♡" /></span>
        </div>
        <div className="one-month-copy">
          <p className="eyebrow">Our current little chapter</p>
          <h2 id="one-month-title"><NeneAgeHeadline /><br /><em>OF LOVE</em></h2>
          <NeneAgeStats />
          <p className="english-quote">“<NeneTotalDays suffix=" days" /> of tiny smiles, little cries, sleepless nights and endless love.”</p>
          <p><NeneTotalDays suffix=" วัน" />ของรอยยิ้มเล็ก ๆ เสียงร้องเบา ๆ คืนที่นอนไม่เต็มอิ่ม และความรักที่เพิ่มขึ้นทุกวัน</p>
        </div>
      </section>

      <section className="gallery section" id="gallery">
        <SectionHeading kicker="Our favourite tiny moments" title="Little Moments 📸" copy="ภาพธรรมดาในแต่ละวัน ที่กลายเป็นความทรงจำแสนพิเศษ" />
        <Gallery items={galleryPhotos} />
      </section>

      <section className="video-memories section section-soft" aria-labelledby="video-title">
        <SectionHeading kicker="Press play, keep forever" title="Moving Memories" copy="เพราะบางความทรงจำสวยงามที่สุดเมื่อได้เห็นมันเคลื่อนไหว" />
        <div className="video-grid">
          {videos.map((video) => (
            <article key={video.src} id={`video-${video.id}`}>
              <video controls playsInline preload="metadata" poster={video.poster} aria-label={video.title}>
                <source src={video.src} type="video/mp4" />
                <track kind="captions" src="/captions/nene-th.vtt" srcLang="th" label="คำบรรยายภาษาไทย" />
              </video>
              <div><span>{video.subtitle}</span><h3>{video.title}</h3></div>
            </article>
          ))}
        </div>
      </section>

      <section className="memories section" id="memories">
        <SectionHeading kicker="Small stories, big love" title="Sweet Memories" copy="เรื่องราวชิ้นเล็ก ๆ ที่เราอยากเก็บไว้อ่านด้วยกันในวันข้างหน้า" />
        <div className="memory-grid">
          {memories.map((memory, index) => (
            <article className="memory-card" key={memory.title}>
              <span className="memory-number">{String(index + 1).padStart(2, "0")}</span>
              <div className="memory-icon">{memory.icon}</div>
              <h3>{memory.title}</h3>
              <p>{memory.text}</p>
              {memory.videoId && <a className="memory-video-link" href={`#video-${memory.videoId}`}>ชมวิดีโอความทรงจำ <span aria-hidden="true">→</span></a>}
            </article>
          ))}
        </div>
      </section>

      <section className="letter section" aria-labelledby="letter-title">
        <div className="letter-photo">
          <Image src={typeof letterContent?.payload?.image_url === "string" ? letterContent.payload.image_url : "/images/nene-smile.jpeg"} alt="รอยยิ้มเล็ก ๆ ของเนเน่" fill sizes="(max-width: 760px) 88vw, 38vw" unoptimized={typeof letterContent?.payload?.image_url === "string"} />
        </div>
        <article className="letter-paper">
          <span className="letter-mark">♡</span>
          <p className="eyebrow">Forever in our hearts</p>
          <h2 id="letter-title">A Letter From<br /><em>Mom & Dad</em></h2>
          <div className="letter-content">
            <p>ถึงเนเน่...</p>
            <p>ตั้งแต่วันที่หนูเข้ามาในชีวิต โลกของเราก็เปลี่ยนไป<br />ทุกวันของเรามีความหมายมากขึ้น<br />รอยยิ้มเล็ก ๆ ของหนูทำให้เรามีความสุข<br />และเราจะคอยอยู่ข้าง ๆ หนูในทุกช่วงเวลาของชีวิต</p>
            <p>รักหนูที่สุด<br /><b>พ่อกับแม่ ♡</b></p>
          </div>
        </article>
      </section>

      <ContactForm />
      <Footer />
    </main>
  );
}
