-- =====================================================================
-- サンプルデータ（動作確認用）
-- schema.sql 実行後に SQL Editor で実行してください。
-- ※ 所属事務所は必ず明記。YOLOメンバーとしての表記はしない。
-- =====================================================================

insert into public.models
  (name, agency, instagram, genre, profile, photo_url, fee, available_start, available_end, status, is_active, passcode)
values
  ('佐藤 みう', 'バレンタインデュウ', '@miu_sato', 'ポートレート',
   E'自然光のやわらかいポートレートが得意です。\n会場では気軽に話しかけてください。',
   'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&q=80',
   '30分 ¥3,000', '13:00', '18:00', 'active', true, 'miu-1234'),

  ('高橋 れな', 'スタジオ・ノクターン', '@rena_takahashi', '映像 / MV',
   E'映像作品・MV出演の経験あり。動きのある撮影が好きです。',
   'https://images.unsplash.com/photo-1488716820095-cbe80883c496?w=600&q=80',
   '30分 ¥4,000', '14:00', '19:00', 'active', true, 'rena-5678'),

  ('小林 あおい', 'バレンタインデュウ', '@aoi_k', 'ファッション',
   E'モード系・ファッション撮影中心。衣装持ち込み相談可。',
   'https://images.unsplash.com/photo-1521577352947-9bb58764b69a?w=600&q=80',
   '30分 ¥3,500', '13:30', '17:30', 'break', true, 'aoi-9012'),

  ('森 ひかり', 'フリーランス', '@hikari_mori', 'ナチュラル',
   E'やさしい雰囲気のナチュラルフォトを撮っています。',
   'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=600&q=80',
   '30分 ¥2,500', '15:00', '18:00', 'active', false, 'hikari-3456');
