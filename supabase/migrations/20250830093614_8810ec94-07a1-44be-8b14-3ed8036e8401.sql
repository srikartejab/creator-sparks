-- Update thumbnail URLs to reference the local public directory images
UPDATE posts 
SET thumbnail_url = '/thumbnails/our-latest-like.png'
WHERE id = 'e1f2a3b4-c5d6-7e8f-9012-345678901234';

UPDATE posts 
SET thumbnail_url = '/thumbnails/sparked-a-lot.png'
WHERE id = 'f2e3d4c5-b6a7-8f90-1234-567890123456';

UPDATE posts 
SET thumbnail_url = '/thumbnails/math-hack.png'
WHERE id = '12345678-9abc-def0-1234-567890abcdef';