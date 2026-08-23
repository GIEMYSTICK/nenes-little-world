import Image from "next/image";
import { ExternalLink, Mail, MapPin, MessageCircle, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer>
      <div className="footer-inner">
        <div className="footer-brand">
          <div className="footer-logo">
            <Image src="/nene_site_logo.png" alt="โลโก้ Nene's Little World" fill sizes="110px" />
          </div>
          <div>
            <h2>Nene&apos;s Little World</h2>
            <p>พื้นที่เล็ก ๆ ที่เก็บทุกความทรงจำอันแสนอบอุ่นของเนเน่</p>
          </div>
        </div>

        <div className="footer-contact" aria-labelledby="contact-title">
          <p className="footer-label" id="contact-title">ช่องทางติดต่อ</p>
          <address>
            <div className="contact-item">
              <MapPin aria-hidden="true" />
              <span>ท่าเสา, อุตรดิตถ์, ประเทศไทย 53000</span>
            </div>
            <a className="contact-item" href="tel:+66903268641">
              <Phone aria-hidden="true" />
              <span>+66 90 326 8641</span>
            </a>
            <a className="contact-item" href="mailto:nene.yanitah2026@gmail.com">
              <Mail aria-hidden="true" />
              <span>nene.yanitah2026@gmail.com</span>
            </a>
            <a className="contact-item" href="https://www.facebook.com/nene.tuajiew/" target="_blank" rel="noreferrer">
              <MessageCircle aria-hidden="true" />
              <span>Facebook: เนเน่ ตัวจิ๋ว</span>
              <ExternalLink className="contact-external" aria-hidden="true" />
            </a>
          </address>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-legal"><a href="/privacy">นโยบายความเป็นส่วนตัว</a><a href="/data-deletion">การลบข้อมูล</a></div>
        <p>Made with love ♡</p>
        <small>© 2026 Nene</small>
      </div>
    </footer>
  );
}
