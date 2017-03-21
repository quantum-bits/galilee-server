-- Fetch practices (old schema)
SELECT DISTINCT
  reading.seq     AS reading_seq,
  "stdRef",
  application.seq AS app_seq,
  practice.title,
  step.seq        AS step_seq,
  step.description
FROM "readingDay"
  INNER JOIN reading ON "readingDay".id = reading."readingDayId"
  INNER JOIN application ON reading.id = application."readingId"
  INNER JOIN practice ON application."practiceId" = practice.id
  INNER JOIN step ON application.id = step."applicationId"
WHERE "readingDay".date = '2017-03-20'
ORDER BY reading.seq, app_seq, step_seq;

-- Fetch practices (new schema)
SELECT
  reading.seq           AS reading_seq,
  "stdRef",
  "direction".seq AS direction_seq,
  practice.title,
  "newStep".id          AS newstep_id,
  "newStep".seq         AS newstep_seq,
  "newStep".description
FROM "readingDay"
  INNER JOIN reading ON "readingDay".id = reading."readingDayId"
  INNER JOIN "direction" ON reading.id = "direction"."readingId"
  INNER JOIN "newStep" ON direction.id = "newStep"."directionId"
  INNER JOIN practice ON direction."practiceId" = practice.id
WHERE "readingDay".date = '2017-03-20'
ORDER BY reading.seq, direction_seq, newstep_seq;

-- Fetch questions (old schema)
SELECT
  "readingDay".date,
  question.seq,
  question.text
FROM "readingDay"
  INNER JOIN question ON "readingDay".id = question."readingDayId"
WHERE "readingDay".date = '2017-03-20'
ORDER BY question.seq;

-- Fetch readingDayPractices (new schema)
SELECT
  date,
  "newStep".seq,
  description
FROM "readingDay"
  INNER JOIN "direction" ON "readingDay".id = "direction"."readingDayId"
  INNER JOIN "newStep" ON direction.id = "newStep"."directionId"
WHERE "readingDay".date = '2017-03-20'
ORDER BY "newStep".seq;
