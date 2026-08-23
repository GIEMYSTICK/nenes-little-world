"use client";

import { useEffect, useState } from "react";
import { NENE_BIRTH_DATE } from "@/data/nene";

type Age = {
  years: number;
  months: number;
  days: number;
  totalDays: number;
  isBorn: boolean;
};

function bangkokToday() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const value = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value ?? 0);

  return { year: value("year"), month: value("month"), day: value("day") };
}

function daysInMonth(year: number, month: number) {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function calculateAge(): Age {
  const today = bangkokToday();
  const birth = NENE_BIRTH_DATE;
  const birthUtc = Date.UTC(birth.year, birth.month - 1, birth.day);
  const todayUtc = Date.UTC(today.year, today.month - 1, today.day);

  if (todayUtc < birthUtc) {
    return { years: 0, months: 0, days: 0, totalDays: 0, isBorn: false };
  }

  let totalMonths = (today.year - birth.year) * 12 + (today.month - birth.month);
  let anchorYear = birth.year + Math.floor(totalMonths / 12);
  let anchorMonth = ((birth.month - 1 + totalMonths) % 12) + 1;
  let anchorDay = Math.min(birth.day, daysInMonth(anchorYear, anchorMonth));

  if (today.day < anchorDay) {
    totalMonths -= 1;
    anchorYear = birth.year + Math.floor(totalMonths / 12);
    anchorMonth = ((birth.month - 1 + totalMonths) % 12) + 1;
    anchorDay = Math.min(birth.day, daysInMonth(anchorYear, anchorMonth));
  }

  const anchorUtc = Date.UTC(anchorYear, anchorMonth - 1, anchorDay);

  return {
    years: Math.floor(totalMonths / 12),
    months: totalMonths % 12,
    days: Math.floor((todayUtc - anchorUtc) / 86_400_000),
    totalDays: Math.floor((todayUtc - birthUtc) / 86_400_000),
    isBorn: true,
  };
}

function useNeneAge() {
  const [age, setAge] = useState<Age | null>(null);

  useEffect(() => {
    const update = () => setAge(calculateAge());
    update();
    const interval = window.setInterval(update, 60 * 60 * 1000);
    return () => window.clearInterval(interval);
  }, []);

  return age;
}

export function NeneAgeThai() {
  const age = useNeneAge();
  if (!age) return <span className="age-loading">กำลังคำนวณ...</span>;
  if (!age.isBorn) return <span>กำลังรอพบหนู</span>;

  const parts = [
    age.years > 0 ? `${age.years} ปี` : "",
    age.months > 0 ? `${age.months} เดือน` : "",
    `${age.days} วัน`,
  ].filter(Boolean);

  return <span aria-live="polite">{parts.join(" ")}</span>;
}

export function NeneAgeEnglish() {
  const age = useNeneAge();
  if (!age) return <span className="age-loading">Calculating...</span>;
  if (!age.isBorn) return <span>Waiting to meet you</span>;
  const parts = [
    age.years > 0 ? `${age.years} ${age.years === 1 ? "year" : "years"}` : "",
    age.months > 0 ? `${age.months} ${age.months === 1 ? "month" : "months"}` : "",
    `${age.days} ${age.days === 1 ? "day" : "days"}`,
  ].filter(Boolean);
  return <span aria-live="polite">{parts.join(" ")}</span>;
}

export function NeneAgeBadge() {
  const age = useNeneAge();
  if (!age) return <><b className="age-loading">—</b><span>growing<br />with love</span></>;
  if (!age.isBorn) return <><b>♡</b><span>coming<br />with love</span></>;

  const value = age.years || age.months || age.days;
  const unit = age.years ? (age.years === 1 ? "year" : "years") : age.months ? (age.months === 1 ? "month" : "months") : (age.days === 1 ? "day" : "days");

  return <><b>{value}</b><span>{unit}<br />of love</span></>;
}

export function NeneAgeHeadline() {
  const age = useNeneAge();
  if (!age) return <span className="age-loading">GROWING</span>;
  if (!age.isBorn) return <span>COMING SOON</span>;

  const parts = [
    age.years > 0 ? `${age.years} ${age.years === 1 ? "YEAR" : "YEARS"}` : "",
    age.months > 0 ? `${age.months} ${age.months === 1 ? "MONTH" : "MONTHS"}` : "",
    `${age.days} ${age.days === 1 ? "DAY" : "DAYS"}`,
  ].filter(Boolean);

  return <span aria-live="polite">{parts.join(" ")}</span>;
}

export function NeneAgeStats({ locale = "th" }: { locale?: "th" | "en" }) {
  const age = useNeneAge();
  const values = age ?? { years: 0, months: 0, days: 0 };

  return (
    <div className="anniversary-stats" aria-label={locale === "en" ? "Nene's current age" : "อายุปัจจุบันของเนเน่"}>
      <div><b>{age ? values.years : "—"}</b><span>Years</span></div>
      <div><b>{age ? values.months : "—"}</b><span>Months</span></div>
      <div><b>{age ? values.days : "—"}</b><span>Days</span></div>
    </div>
  );
}

export function NeneTotalDays({ suffix = "" }: { suffix?: string }) {
  const age = useNeneAge();
  if (!age) return <span className="age-loading">—</span>;
  if (!age.isBorn) return <span>0{suffix}</span>;
  return <span aria-live="polite">{age.totalDays.toLocaleString("th-TH")}{suffix}</span>;
}
