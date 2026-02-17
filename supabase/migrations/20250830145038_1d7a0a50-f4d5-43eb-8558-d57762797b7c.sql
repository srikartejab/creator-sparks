-- Delete related records first to avoid foreign key violations
DELETE FROM quality_assessments 
WHERE post_id IN (
  'd1d8a3fc-190c-4f76-bdf7-e0f0a258d0ad',
  '724bb217-6834-4b35-97c4-2f9488335c46', 
  'a450ac8f-e710-4f5e-9e25-ea40d06ec169'
);

DELETE FROM fraud_alerts 
WHERE post_id IN (
  'd1d8a3fc-190c-4f76-bdf7-e0f0a258d0ad',
  '724bb217-6834-4b35-97c4-2f9488335c46',
  'a450ac8f-e710-4f5e-9e25-ea40d06ec169'
);

DELETE FROM weekly_earnings 
WHERE post_id IN (
  'd1d8a3fc-190c-4f76-bdf7-e0f0a258d0ad',
  '724bb217-6834-4b35-97c4-2f9488335c46',
  'a450ac8f-e710-4f5e-9e25-ea40d06ec169'
);

-- Delete the main posts
DELETE FROM posts 
WHERE id IN (
  'd1d8a3fc-190c-4f76-bdf7-e0f0a258d0ad',
  '724bb217-6834-4b35-97c4-2f9488335c46',
  'a450ac8f-e710-4f5e-9e25-ea40d06ec169'
);