const conn = require('../db/instance');
const uuidv4 = require('uuid').v4;
class ArticleModel {
    constructor(data) {
        this.article_id = data?.article_id;
        this.username = data?.username;
        this.user_id = data?.id;
        this.content = data?.content;
        this.tags = data?.tags;
        this.references = data?.references;
        this.title = data?.title;
        this.currentUpvotes = data?.currentUpvotes;
        this.currentDownvotes = data?.currentDownvotes;
    }

    static findByTitle(title) {
        return new Promise((resolve, reject) => {
            const queryString = `
                SELECT 
                    a.article_id,
                    a.title,
                    a.content,
                    a.id AS user_id,
                    u.username,
                    -- Aggregate tags
                    GROUP_CONCAT(DISTINCT t.tagName) AS tag_list,
                    -- Aggregate references as JSON-like strings
                    GROUP_CONCAT(DISTINCT CONCAT(r.to_article_id, ':', ar2.title)) AS ref_list,
                    -- Aggregate upvotes/downvotes separately
                    GROUP_CONCAT(DISTINCT CASE WHEN v.value = TRUE THEN v.id END) AS upvote_users,
                    GROUP_CONCAT(DISTINCT CASE WHEN v.value = FALSE THEN v.id END) AS downvote_users
                FROM articles a
                JOIN users u ON a.id = u.id
                LEFT JOIN tags t ON a.article_id = t.article_id
                LEFT JOIN references_table r ON a.article_id = r.article_id
                LEFT JOIN articles ar2 ON r.to_article_id = ar2.article_id
                LEFT JOIN votes v ON a.article_id = v.article_id
                WHERE a.title LIKE CONCAT('%', ?, '%')
                GROUP BY a.article_id, a.title, a.content, a.id, u.username
            `;

            conn.query(queryString, [title], (err, result) => {
                if (err) {
                    return reject(err);
                }

                if (result.length === 0) {
                    return resolve(null);
                }

                const transformed = result.map(row => {
                    // Parse tags into an array
                    const tags = row.tag_list ? row.tag_list.split(',') : [];

                    // Parse references into array of objects { to_article_id, title }
                    const references = row.ref_list
                        ? row.ref_list.split(',').map(ref => {
                            const [to_article_id, title] = ref.split(':');
                            return { to_article_id, title };
                        })
                        : [];

                    // Parse upvote and downvote user IDs
                    const currentUpvotes = row.upvote_users
                        ? row.upvote_users.split(',').filter(Boolean)
                        : [];
                    const currentDownvotes = row.downvote_users
                        ? row.downvote_users.split(',').filter(Boolean)
                        : [];

                    return new ArticleModel({
                        article_id: row.article_id,
                        username: row.username,
                        id: row.user_id,
                        content: row.content,
                        tags,
                        references,
                        title: row.title,
                        currentUpvotes,
                        currentDownvotes
                    });
                });

                resolve(transformed);
            });
        });
    }

    save() {
        const articleData = this;

        return new Promise((resolve, reject) => {
            conn.beginTransaction(async (txErr) => {
                if (txErr) return reject(txErr);

                try {
                    // check for unique title
                    const checkTitleQuery = `SELECT article_id FROM articles WHERE title = ? LIMIT 1`;
                    const [existingTitle] = await new Promise((res, rej) => {
                        conn.query(checkTitleQuery, [articleData.title], (err, rows) => {
                            if (err) return rej(err);
                            res(rows);
                        });
                    });

                    if (existingTitle) {
                        const error = new Error(`Article title "${articleData.title}" already exists.`);
                        error.name = 'RepeatedTitleError';
                        await conn.rollback();
                        return reject(error);
                    }

                    // validate references
                    const references = Array.isArray(articleData.references)
                        ? articleData.references.map(r => r.to_article_id || r)
                        : [];

                    if (references.length > 0) {
                        const checkRefsQuery = `
                            SELECT article_id FROM articles WHERE article_id IN (?)
                        `;
                        const [foundRefs] = await new Promise((res, rej) => {
                            conn.query(checkRefsQuery, [references], (err, rows) => {
                                if (err) return rej(err);
                                res([rows]);
                            });
                        });

                        const foundIds = foundRefs.map(r => r.article_id);
                        const missingRefs = references.filter(id => !foundIds.includes(id));

                        if (missingRefs.length > 0) {
                            const error = new Error(
                                `Invalid references: ${missingRefs.join(', ')}`
                            );
                            error.name = 'ReferenceError';
                            await conn.rollback();
                            return reject(error);
                        }
                    }

                    // insert article
                    const newId = uuidv4();
                    const insertArticleQuery = `
                        INSERT INTO articles (article_id, id, title, content)
                        VALUES (?, ?, ?, ?)
                    `;
                    await new Promise((res, rej) => {
                        conn.query(
                            insertArticleQuery,
                            [newId, articleData.user_id, articleData.title, articleData.content],
                            (err) => (err ? rej(err) : res())
                        );
                    });

                    // insert tags if provided
                    if (Array.isArray(articleData.tags) && articleData.tags.length > 0) {
                        const insertTagsQuery = `
                            INSERT INTO tags (article_id, tagName)
                            VALUES ?
                        `;
                        const tagValues = articleData.tags.map(tag => [newId, tag]);
                        await new Promise((res, rej) => {
                            conn.query(insertTagsQuery, [tagValues], (err) => (err ? rej(err) : res()));
                        });
                    }

                    // insert references if provided
                    if (references.length > 0) {
                        const insertRefsQuery = `
                            INSERT INTO references_table (article_id, to_article_id)
                            VALUES ?
                        `;
                        const refValues = references.map(toId => [newId, toId]);
                        await new Promise((res, rej) => {
                            conn.query(insertRefsQuery, [refValues], (err) => (err ? rej(err) : res()));
                        });
                    }

                    // commit transaction
                    conn.commit((commitErr) => {
                        if (commitErr) {
                            conn.rollback(() => reject(commitErr));
                        } else {
                            articleData.article_id = newId;
                            resolve(new ArticleModel(articleData));
                        }
                    });

                } catch (error) {
                    conn.rollback(() => reject(error));
                }
            });
        });
    }

}

module.exports = ArticleModel;