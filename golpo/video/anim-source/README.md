# কাঁধের ভার: অ্যানিমেশনের সোর্স

Anime Watercolor স্টাইলে বানানো। পুরো ভিডিও `anim.js`-এর `render(t)` ফাংশন দিয়ে আঁকা হয় (HTML canvas)।

- `align.py <voice.mp3>`: ভয়েসের বিরতি ধরে স্ক্রিপ্টের লাইনগুলোর সময় বের করে (`timing.json`)
- `lines.js`: সাবটাইটেলের লাইন আর সময়
- `rend.js <voice.mp3> <out.mp4> [h|v]`: ভিডিও রেন্ডার (h = 16:9, v = 9:16)। Playwright আর ffmpeg লাগে।
- `vstill.js <h|v> <time...|thumbT>`: নির্দিষ্ট সময়ের ছবি বা থাম্বনেইল

ফন্ট: Baloo Da 2 (SIL Open Font License)
