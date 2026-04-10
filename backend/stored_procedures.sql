USE blog_db;

DROP PROCEDURE IF EXISTS GetDashboardSummary;
DROP PROCEDURE IF EXISTS GetCategoryStats;
DROP PROCEDURE IF EXISTS GetUserStats;
DROP PROCEDURE IF EXISTS SearchBlogs;
DROP PROCEDURE IF EXISTS UpdateBlogStatusBulk;

DELIMITER //

CREATE PROCEDURE GetDashboardSummary()
BEGIN
    SELECT
        (SELECT COUNT(*) FROM blogs_category) AS category_count,
        (SELECT COUNT(*) FROM blogs_blog) AS blogs_count,
        (SELECT COUNT(*) FROM blogs_blog WHERE status = 'Published') AS published_blogs_count,
        (SELECT COUNT(*) FROM auth_user) AS users_count,
        (SELECT COUNT(*) FROM blogs_comment) AS comments_count;
END //

CREATE PROCEDURE GetCategoryStats()
BEGIN
    SELECT
        c.id,
        c.category_name,
        COUNT(DISTINCT b.id) AS total_posts,
        COUNT(DISTINCT CASE WHEN b.status = 'Published' THEN b.id END) AS published_posts,
        COUNT(DISTINCT CASE WHEN b.status = 'Draft' THEN b.id END) AS draft_posts,
        COUNT(DISTINCT cm.id) AS total_comments,
        COALESCE(MAX(b.updated_at), c.updated_at) AS last_update,
        c.created_at,
        c.updated_at
    FROM blogs_category c
    LEFT JOIN blogs_blog b ON b.category_id = c.id
    LEFT JOIN blogs_comment cm ON cm.blog_id = b.id
    GROUP BY c.id, c.category_name, c.created_at, c.updated_at
    ORDER BY published_posts DESC, c.category_name ASC;
END //

CREATE PROCEDURE GetUserStats(IN p_user_id INT)
BEGIN
    SELECT
        u.id,
        u.username,
        u.email,
        u.first_name,
        u.last_name,
        u.is_staff,
        u.is_superuser,
        COUNT(DISTINCT b.id) AS total_posts,
        COUNT(DISTINCT CASE WHEN b.status = 'Published' THEN b.id END) AS published_posts,
        COUNT(DISTINCT CASE WHEN b.status = 'Draft' THEN b.id END) AS draft_posts,
        COUNT(DISTINCT cm.id) AS comments_received,
        COALESCE(MAX(b.updated_at), u.date_joined) AS last_post_date,
        u.date_joined,
        u.last_login
    FROM auth_user u
    LEFT JOIN blogs_blog b ON b.author_id = u.id
    LEFT JOIN blogs_comment cm ON cm.blog_id = b.id
    WHERE p_user_id IS NULL OR u.id = p_user_id
    GROUP BY
        u.id, u.username, u.email, u.first_name, u.last_name,
        u.is_staff, u.is_superuser, u.date_joined, u.last_login
    ORDER BY total_posts DESC, u.username ASC;
END //

CREATE PROCEDURE SearchBlogs(IN p_keyword VARCHAR(255))
BEGIN
    SELECT
        b.id,
        b.title,
        b.slug,
        b.category_id AS category,
        c.category_name,
        b.author_id AS author,
        u.username AS author_name,
        b.featured_image,
        b.short_description,
        b.status,
        b.is_featured,
        b.created_at,
        b.updated_at,
        COUNT(DISTINCT cm.id) AS comment_count,
        CASE
            WHEN b.title LIKE CONCAT(TRIM(p_keyword), '%') THEN 1
            WHEN b.title LIKE CONCAT('%', TRIM(p_keyword), '%') THEN 2
            WHEN b.short_description LIKE CONCAT('%', TRIM(p_keyword), '%') THEN 3
            WHEN b.blog_body LIKE CONCAT('%', TRIM(p_keyword), '%') THEN 4
            ELSE 5
        END AS relevance_score
    FROM blogs_blog b
    JOIN auth_user u ON u.id = b.author_id
    JOIN blogs_category c ON c.id = b.category_id
    LEFT JOIN blogs_comment cm ON cm.blog_id = b.id
    WHERE
        b.status = 'Published'
        AND TRIM(p_keyword) <> ''
        AND (
            b.title LIKE CONCAT('%', TRIM(p_keyword), '%')
            OR b.short_description LIKE CONCAT('%', TRIM(p_keyword), '%')
            OR b.blog_body LIKE CONCAT('%', TRIM(p_keyword), '%')
        )
    GROUP BY
        b.id, b.title, b.slug, b.category_id, c.category_name,
        b.author_id, u.username, b.featured_image, b.short_description,
        b.status, b.is_featured, b.created_at, b.updated_at
    ORDER BY relevance_score ASC, b.updated_at DESC;
END //

CREATE PROCEDURE UpdateBlogStatusBulk(
    IN p_blog_ids JSON,
    IN p_new_status VARCHAR(20)
)
BEGIN
    IF p_new_status NOT IN ('Draft', 'Published') THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Invalid status value';
    END IF;

    UPDATE blogs_blog
    SET
        status = p_new_status,
        updated_at = NOW()
    WHERE id IN (
        SELECT CAST(jt.blog_id AS UNSIGNED)
        FROM JSON_TABLE(
            p_blog_ids,
            '$[*]' COLUMNS (
                blog_id VARCHAR(20) PATH '$'
            )
        ) AS jt
    );

    SELECT ROW_COUNT() AS affected_rows;
END //

DELIMITER ;
