-- ============================================================
-- University App · Engagement & Reporting Queries
-- ============================================================

-- ----------------------------------------------------------
-- 1. Forum engagement summary per department
--    (threads created, total posts, unique participants, reactions)
-- ----------------------------------------------------------
SELECT
    d.name                                  AS department,
    f.name                                  AS forum_name,
    COUNT(DISTINCT t.thread_id)             AS total_threads,
    COUNT(DISTINCT p.post_id)               AS total_posts,
    COUNT(DISTINCT p.author_id)             AS unique_authors,
    COUNT(DISTINCT pr.reaction_id)          AS total_reactions,
    ROUND(
        COUNT(DISTINCT p.post_id)::NUMERIC /
        NULLIF(COUNT(DISTINCT t.thread_id), 0), 2
    )                                       AS avg_posts_per_thread
FROM departments d
JOIN forums       f  ON f.dept_id   = d.dept_id
JOIN threads      t  ON t.forum_id  = f.forum_id
LEFT JOIN posts   p  ON p.thread_id = t.thread_id AND NOT p.is_deleted
LEFT JOIN post_reactions pr ON pr.post_id = p.post_id
GROUP BY d.dept_id, d.name, f.forum_id, f.name
ORDER BY total_posts DESC;


-- ----------------------------------------------------------
-- 2. Top contributors (by post count + reactions received)
--    for a given term's active forums
-- ----------------------------------------------------------
SELECT
    u.display_name,
    u.email,
    r.name                              AS role,
    COUNT(DISTINCT p.post_id)           AS posts_authored,
    COALESCE(SUM(rct.reaction_count), 0) AS reactions_received,
    COUNT(DISTINCT t.thread_id)         AS threads_started
FROM users u
JOIN roles  r ON r.role_id = u.role_id
LEFT JOIN posts   p ON p.author_id  = u.user_id AND NOT p.is_deleted
LEFT JOIN threads t ON t.author_id  = u.user_id
LEFT JOIN (
    SELECT post_id, COUNT(*) AS reaction_count
    FROM post_reactions
    GROUP BY post_id
) rct ON rct.post_id = p.post_id
GROUP BY u.user_id, u.display_name, u.email, r.name
HAVING COUNT(DISTINCT p.post_id) > 0
ORDER BY posts_authored DESC, reactions_received DESC
LIMIT 25;


-- ----------------------------------------------------------
-- 3. Course section enrollment health
--    (fill rate, waitlist size, drop rate per term)
-- ----------------------------------------------------------
SELECT
    tm.name                                         AS term,
    d.code                                          AS dept,
    c.code                                          AS course_code,
    c.title                                         AS course_title,
    cs.section_code,
    u.display_name                                  AS instructor,
    cs.max_capacity,
    COUNT(*) FILTER (WHERE e.status = 'enrolled')   AS enrolled_count,
    COUNT(*) FILTER (WHERE e.status = 'waitlisted') AS waitlisted_count,
    COUNT(*) FILTER (WHERE e.status = 'dropped')    AS dropped_count,
    ROUND(
        COUNT(*) FILTER (WHERE e.status = 'enrolled')::NUMERIC
        / cs.max_capacity * 100, 1
    )                                               AS fill_pct
FROM terms tm
JOIN course_sections cs ON cs.term_id     = tm.term_id
JOIN courses          c  ON c.course_id   = cs.course_id
JOIN departments      d  ON d.dept_id     = c.dept_id
JOIN users            u  ON u.user_id     = cs.instructor_id
LEFT JOIN enrollments e  ON e.section_id  = cs.section_id
GROUP BY tm.term_id, tm.name, d.dept_id, d.code,
         c.course_id, c.code, c.title,
         cs.section_id, cs.section_code, cs.max_capacity,
         u.display_name
ORDER BY tm.name, fill_pct DESC;


-- ----------------------------------------------------------
-- 4. Weekly activity trend (posts + threads + events RSVPs)
--    Rolling 12 weeks
-- ----------------------------------------------------------
SELECT
    DATE_TRUNC('week', activity_at)    AS week_start,
    SUM(post_count)                    AS posts,
    SUM(thread_count)                  AS threads,
    SUM(rsvp_count)                    AS event_rsvps,
    SUM(post_count + thread_count + rsvp_count) AS total_activity
FROM (
    SELECT created_at AS activity_at, 1 AS post_count, 0 AS thread_count, 0 AS rsvp_count
    FROM posts WHERE NOT is_deleted
    UNION ALL
    SELECT created_at, 0, 1, 0 FROM threads
    UNION ALL
    SELECT rsvp_at,   0, 0, 1 FROM event_rsvps
) combined
WHERE activity_at >= NOW() - INTERVAL '12 weeks'
GROUP BY DATE_TRUNC('week', activity_at)
ORDER BY week_start;


-- ----------------------------------------------------------
-- 5. Most-viewed threads with reaction breakdown
-- ----------------------------------------------------------
SELECT
    t.title,
    f.name                                      AS forum,
    t.view_count,
    COUNT(DISTINCT p.post_id)                   AS reply_count,
    COUNT(DISTINCT p.author_id)                 AS participants,
    COUNT(pr.reaction_id) FILTER (
        WHERE rt.name = 'like')                 AS likes,
    COUNT(pr.reaction_id) FILTER (
        WHERE rt.name = 'helpful')              AS helpful_marks,
    t.created_at
FROM threads t
JOIN forums f             ON f.forum_id  = t.forum_id
LEFT JOIN posts p         ON p.thread_id = t.thread_id AND NOT p.is_deleted
LEFT JOIN post_reactions pr ON pr.post_id = p.post_id
LEFT JOIN reaction_types rt ON rt.reaction_type_id = pr.reaction_type_id
GROUP BY t.thread_id, t.title, f.name, t.view_count, t.created_at
ORDER BY t.view_count DESC
LIMIT 20;


-- ----------------------------------------------------------
-- 6. Student grade distribution per course (current term)
-- ----------------------------------------------------------
SELECT
    c.code                                   AS course,
    c.title,
    cs.section_code,
    e.grade,
    COUNT(*)                                 AS student_count,
    ROUND(COUNT(*)::NUMERIC /
        SUM(COUNT(*)) OVER (PARTITION BY cs.section_id) * 100, 1) AS pct
FROM enrollments e
JOIN course_sections cs ON cs.section_id = e.section_id
JOIN courses         c  ON c.course_id   = cs.course_id
JOIN terms           tm ON tm.term_id    = cs.term_id AND tm.is_active
WHERE e.status = 'completed'
  AND e.grade IS NOT NULL
GROUP BY c.course_id, c.code, c.title, cs.section_id, cs.section_code, e.grade
ORDER BY c.code, cs.section_code, e.grade;
