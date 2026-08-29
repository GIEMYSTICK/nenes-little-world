export const NENE_BIRTH_DATE = { year: 2026, month: 7, day: 9 } as const;

export const baby = {
  thaiName: "เนเน่",
  englishName: "Nene",
  birthDate: "9 กรกฎาคม",
  birthDateShort: "9 July",
  birthWeight: "2.8 kg",
  currentWeight: "ประมาณ 4 kg",
};

export const milestones = [
  {
    date: "09 JUL",
    title: "Hello World",
    description: "วันที่เนเน่เกิดและได้พบกับโลกใบนี้เป็นครั้งแรก",
    icon: "♡",
  },
  {
    date: "1 MONTH",
    title: "My First Month",
    description: "ครบ 1 เดือนแล้ว หนูเติบโตขึ้นท่ามกลางความรักทุกวัน",
    icon: "✦",
  },
  {
    date: "GROWING",
    title: "I'm Growing!",
    description: "น้ำหนักเพิ่มขึ้น และมีเรื่องน่ารักให้เราได้ค้นพบในทุกวัน",
    icon: "☁",
  },
];

export const photos = [
  { src: "/images/nene-wink.jpeg", alt: "เนเน่ขยิบตาในชุดสีฟ้า", caption: "เจ้าตัวเล็กขยิบตา", captionEn: "A tiny wink" },
  { src: "/images/nene-one-month.jpeg", alt: "ภาพฉลองเนเน่ครบหนึ่งเดือน", caption: "ครบหนึ่งเดือนแล้วนะ", captionEn: "One month of love" },
  { src: "/images/nene-smile.jpeg", alt: "เนเน่ยิ้มแลบลิ้นเล็กน้อย", caption: "รอยยิ้มประจำวัน", captionEn: "Today's little smile" },
  { src: "/images/nene-blue-hat.jpeg", alt: "เนเน่ใส่หมวกสีฟ้า", caption: "หมวกใบโปรด", captionEn: "My favourite blue hat" },
  { src: "/images/nene-pink-blanket.jpeg", alt: "เนเน่ห่อตัวในผ้าสีชมพู", caption: "อุ่นที่สุด", captionEn: "Warm and cosy" },
  { src: "/images/nene-awake.jpeg", alt: "เนเน่ลืมตาในชุดสีฟ้า", caption: "ตื่นมาดูโลก", captionEn: "Wide awake" },
  { src: "/images/nene-sleeping.jpeg", alt: "เนเน่นอนหลับบนผ้าห่มสีฟ้า", caption: "ฝันหวานนะคะ", captionEn: "Sweet dreams" },
  { src: "/images/nene-milk.jpeg", alt: "เนเน่กำลังดื่มนม", caption: "มื้ออร่อยของหนู", captionEn: "A delicious little meal" },
  { src: "/images/nene-car-seat.jpeg", alt: "เนเน่นอนในคาร์ซีต", caption: "พร้อมออกเดินทาง", captionEn: "Ready for an adventure" },
  { src: "/images/nene-card.png", alt: "การ์ดข้อความน่ารักของเนเน่", caption: "วันอาทิตย์ของเนเน่", captionEn: "Nene's Sunday" },
  { src: "/images/nene-joy.png", alt: "เนเน่ยกแขนยิ้มอย่างสดใส", caption: "เย้! โลกของหนู", captionEn: "Hooray, my little world!" },
];

export const memories = [
  { icon: "🏠", title: "วันแรกที่กลับบ้าน", text: "บ้านของเรามีสมาชิกตัวจิ๋วเพิ่มขึ้นอีกหนึ่งคน", videoId: "first-day-home" },
  { icon: "☺", title: "รอยยิ้มแรก", text: "รอยยิ้มเล็ก ๆ ที่ทำให้หัวใจของพ่อกับแม่พองโต" },
  { icon: "🫧", title: "อาบน้ำครั้งแรก", text: "ช่วงเวลาอบอุ่นและแสนอ่อนโยนของครอบครัว" },
  { icon: "♡", title: "วันที่ครบ 1 เดือน", text: "หนึ่งเดือนแห่งการเรียนรู้ เติบโต และรักกันมากขึ้น", videoId: "one-month" },
  { icon: "🌙", title: "คืนที่แสนอบอุ่น", text: "แม้จะนอนไม่เต็มอิ่ม แต่ทุกนาทีมีความหมายเสมอ" },
  { icon: "✦", title: "ช่วงเวลาเล็ก ๆ", text: "ทุกสีหน้าและทุกท่าทาง คือความทรงจำล้ำค่า" },
];

export const videos = [
  {
    id: "first-day-home",
    src: "/videos/first-day-home.mp4",
    title: "วันแรกที่กลับบ้าน",
    subtitle: "Our first day home",
    poster: "/images/nene-car-seat.jpeg",
  },
  {
    id: "one-month",
    src: "/videos/one-month.mp4",
    title: "วันครบรอบ 1 เดือน",
    subtitle: "One month of love",
    poster: "/images/nene-one-month.jpeg",
  },
];
