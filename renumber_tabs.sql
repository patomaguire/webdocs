-- Temporarily drop unique constraint
ALTER TABLE tabs_content DROP INDEX unique_document_tab;

-- Renumber tabs using CASE statement (10k range for 100+ documents)
UPDATE tabs_content 
SET tabNumber = CASE tabNumber
  WHEN 0 THEN 100
  WHEN 1 THEN 1000
  WHEN 2 THEN 2000
  WHEN 3 THEN 3000
  WHEN 4 THEN 4000
  WHEN 5 THEN 5000
  WHEN 6 THEN 6000
  WHEN 7 THEN 7000
  WHEN 8 THEN 8000
  WHEN 9 THEN 9000
  WHEN 10 THEN 10000
  WHEN 11 THEN 200
  ELSE tabNumber
END;

-- Recreate unique constraint
ALTER TABLE tabs_content ADD UNIQUE INDEX unique_document_tab (documentId, tabNumber);

-- Verify
SELECT documentId, tabNumber, tabTitle FROM tabs_content WHERE documentId = 1 ORDER BY tabNumber;
