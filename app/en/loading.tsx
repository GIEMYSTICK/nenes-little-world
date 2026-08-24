import Image from "next/image";
import styles from "../loading.module.css";

export default function EnglishLoading() {
  return (
    <main className={styles.screen} role="status" aria-live="polite" aria-label="Loading page">
      <section className={styles.card}>
        <div className={styles.logoRing} aria-hidden="true">
          <div className={styles.logo}>
            <Image src="/nene-logo-v2.png" alt="" fill sizes="122px" priority />
          </div>
        </div>
        <p className={styles.title}>Loading...</p>
        <p className={styles.subtitle}>Taking you to Nene&apos;s little world ♡<br />Just a tiny moment, please</p>
        <div className={styles.dots} aria-hidden="true"><i /><i /><i /></div>
      </section>
    </main>
  );
}
