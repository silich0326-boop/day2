// Vercel 서버리스 함수: 키는 서버의 환경변수(PIXABAY_KEY)에만 있고 브라우저로 나가지 않아요.
module.exports = async (req, res) => {
  const key = process.env.PIXABAY_KEY;
  if (!key) {
    res.status(500).json({ error: '서버에 PIXABAY_KEY 환경변수가 없어요.' });
    return;
  }

  const q = String(req.query.q || '').trim().slice(0, 100);
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  if (!q) {
    res.status(400).json({ error: '검색어를 입력해 주세요.' });
    return;
  }

  const url = 'https://pixabay.com/api/?key=' + encodeURIComponent(key) +
    '&q=' + encodeURIComponent(q) +
    '&image_type=photo&per_page=10&page=' + page;

  try {
    const r = await fetch(url);
    if (!r.ok) {
      res.status(502).json({ error: 'Pixabay에서 오류가 났어요 (' + r.status + ')' });
      return;
    }
    const data = await r.json();
    res.setHeader('Cache-Control', 's-maxage=300');
    res.status(200).json({ totalHits: data.totalHits, hits: data.hits });
  } catch (e) {
    res.status(502).json({ error: 'Pixabay에 연결하지 못했어요.' });
  }
};
