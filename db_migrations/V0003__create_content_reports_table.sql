CREATE TABLE IF NOT EXISTS content_reports (
  id SERIAL PRIMARY KEY,
  story_id INT NOT NULL,
  comment_id INT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_content_reports_story_id ON content_reports(story_id);
