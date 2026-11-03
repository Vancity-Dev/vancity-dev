-- One photo per slot of a template. Stored in D1 (the admin page downsizes before upload, and
-- the server caps the size) so there is no extra bucket to create before deploying.
CREATE TABLE template_images (
  industry      TEXT NOT NULL,
  slot          TEXT NOT NULL,
  content_type  TEXT NOT NULL,
  data          BLOB NOT NULL,
  alt           TEXT NOT NULL DEFAULT '',
  updated_at    INTEGER NOT NULL,
  PRIMARY KEY (industry, slot)
);
