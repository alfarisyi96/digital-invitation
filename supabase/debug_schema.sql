-- Test query to verify column structure and get sample data
-- This should be run in Supabase SQL editor to verify schema

-- Check templates table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'templates' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check invitation_comments table structure  
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'invitation_comments' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check rsvp_responses table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'rsvp_responses' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Test a sample query that would be used by the app
SELECT 
  i.id,
  i.title,
  i.description,
  i.event_date,
  i.location,
  i.custom_data,
  i.status,
  i.views_count,
  i.rsvp_count,
  i.confirmed_count,
  i.is_published,
  i.created_at,
  t.id as template_id,
  t.name as template_name,
  t.category as template_category,
  t.tier as template_tier,
  t.slug as template_slug,
  t.template_data,
  t.thumbnail_url,
  t.required_package,
  t.features
FROM invites i
LEFT JOIN templates t ON i.template_id = t.id
WHERE i.is_published = true
LIMIT 1;
