import Image from "next/image";
import styles from "./loading.module.css";

export default function Loading() {
  return (
    <main className={styles.screen} role="status" aria-live="polite" aria-label="กำลังโหลดหน้าเว็บไซต์">
      <section className={styles.card}>
        <div className={styles.logoRing} aria-hidden="true">
          <div className={styles.logo}>
            <Image src="/nene-logo-v2.png" alt="" fill sizes="122px" priority />
          </div>
        </div>
        <p className={styles.title}>Loading...</p>
        <p className={styles.subtitle}>กำลังพาไปหาเนเน่ รอสักครู่นะคะ ♡<br />A little moment, please</p>
        <div className={styles.dots} aria-hidden="true"><i /><i /><i /></div>
      </section>
    </main>
  );
}
