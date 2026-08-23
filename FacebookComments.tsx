"use client";

import { useEffect, useState } from "react";
import { MessageCircle, ShieldCheck } from "lucide-react";

declare global {
  interface Window {
    FB?: {
      init: (options: { appId: string; cookie: boolean; xfbml: boolean; version: string }) => void;
      XFBML: { parse: (element?: HTMLElement) => void };
    };
    fbAsyncInit?: () => void;
  }
}

const appId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;
const graphVersion = process.env.NEXT_PUBLIC_FACEBOOK_GRAPH_VERSION || "v26.0";
const commentsUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");

export function FacebookComments() {
  const [ready, setReady] = useState(false);
  const isConfigured = Boolean(appId && commentsUrl);

  useEffect(() => {
    if (!appId || !commentsUrl) return;

    const renderComments = () => {
      window.FB?.XFBML.parse(document.querySelector<HTMLElement>(".facebook-comments-box") ?? undefined);
      setReady(true);
    };

    window.fbAsyncInit = () => {
      window.FB?.init({ appId, cookie: true, xfbml: true, version: graphVersion });
      renderComments();
    };

    const existingScript = document.getElementById("facebook-jssdk");
    if (existingScript) {
      if (window.FB) renderComments();
      return;
    }

    const script = document.createElement("script");
    script.id = "facebook-jssdk";
    script.src = "https://connect.facebook.net/th_TH/sdk.js";
    script.async = true;
    script.defer = true;
    script.crossOrigin = "anonymous";
    document.body.appendChild(script);
  }, []);

  return (
    <section className="comments-section section" id="comments" aria-labelledby="comments-title">
      <div className="comments-intro">
        <p className="eyebrow">Leave a little note</p>
        <h2 id="comments-title">ฝากข้อความถึงเนเน่ <span>♡</span></h2>
        <p>ร่วมเก็บคำอวยพรและความทรงจำดี ๆ ไว้ให้น้องเนเน่อ่านในวันข้างหน้า</p>
        <div className="comments-login-note"><ShieldCheck size={17} /> ต้องเข้าสู่ระบบ Facebook ก่อนแสดงความคิดเห็น</div>
      </div>

      <div className="comments-card">
        <div className="comments-card-head">
          <div className="comments-icon"><MessageCircle size={22} /></div>
          <div><b>ความคิดเห็นจากผู้เยี่ยมชม</b><span>Facebook Comments</span></div>
        </div>

        {!isConfigured ? (
          <div className="comments-setup">
            <b>ส่วนความคิดเห็นพร้อมเชื่อมต่อแล้ว</b>
            <p>เพิ่ม <code>NEXT_PUBLIC_FACEBOOK_APP_ID</code> และ <code>NEXT_PUBLIC_SITE_URL</code> ใน Vercel แล้ว Deploy ใหม่เพื่อเปิดใช้งาน</p>
            <a href="https://developers.facebook.com/apps/" target="_blank" rel="noreferrer">ไปที่ Meta for Developers ↗</a>
          </div>
        ) : (
          <div className={`facebook-comments-box ${ready ? "is-ready" : ""}`}>
            {!ready && <p className="comments-loading">กำลังโหลดความคิดเห็นจาก Facebook...</p>}
            {commentsUrl && (
              <div
                className="fb-comments"
                data-href={commentsUrl}
                data-width="100%"
                data-numposts="8"
                data-order-by="reverse_time"
              />
            )}
          </div>
        )}
      </div>
    </section>
  );
}
