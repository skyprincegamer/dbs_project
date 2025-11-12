const conn = require('../db/instance');
const { objToSqlSetString } = require('../utils/queryBuildHelper');
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
    static findByID(id){
        return new Promise((resolve , reject) => {
            const query = `
                SELECT * FROM articles WHERE article_id = ?
            `
            conn.query(
                query,
                [id], (err, result, fields) => {
                    if(err)
                        return reject(err)
                    else if (result.length == 0)
                        return resolve(null)
                    else {
                        return resolve(result[0])
                    }
                }
            )
        })
    }
    static findTagsByID(id){
        return new Promise((resolve , reject) => {
            const query = `
                    SELECT tagName FROM tags WHERE article_id = ?
                `
            conn.query(
                query,
                [id], (err, result, fields) => {
                    if(err)
                        return reject(err)
                    else if (result.length == 0)
                        return resolve(null)
                    else {
                        return resolve(result)
                    }
                }
            )
        })
    }
    static giveAllReferences(id){
        return new Promise((resolve , reject) => {
            const query = `
                    SELECT to_article_id FROM references_table WHERE article_id = ?
                `
            conn.query(
                query,
                [id], (err, result, fields) => {
                    if(err)
                        return reject(err)
                    else if (result.length == 0)
                        return resolve(null)
                    else {
                        return resolve(result)
                    }
                }
            )
        })

    }
    static voteArticle(article_id, user_id, value){
        return new Promise((resolve , reject) => {
            console.log(article_id, user_id, value);
            if(value==-1){
                // remove vote
                const query = `
                    DELETE FROM votes WHERE article_id = ? AND id = ?
                `;
                conn.query(
                    query,
                    [article_id, user_id], (err, result, fields) => {
                        if(err)
                            return reject(err)
                        else {
                            return resolve(result)
                        }
                    }
                );
            }else {
                // if vote exists update else insert
                const query = `
                    INSERT INTO votes (article_id, id, value)
                    VALUES (?, ?, ?)
                    ON DUPLICATE KEY UPDATE value = VALUES(value)
                `;
                console.log(article_id, user_id, value);
                conn.query(query, [article_id, user_id, value === 1], (err, result, fields) => {
                    if (err)
                        return reject(err)
                    else {
                        return resolve(result)
                    }
                });
            }
        });
    }

    // Depricecated: use findByTags instead
    static findByTags(tags) {
        return new Promise((resolve, reject) => {
            const afterWhere = objToSqlSetString(tags);
            // Keep afterWhere as condition after WHERE in tags. Join with articles table to get title and join with users to get username

            const queryString = `
                SELECT articles.*, users.username FROM articles
                JOIN tags ON articles.article_id = tags.article_id
                JOIN users ON articles.id = users.id
                WHERE ${afterWhere}
                GROUP BY articles.article_id
            `;
            conn.query(queryString, (err, result) => {
                if (err) {
                    return reject(err);
                } else {
                    return resolve(result.length > 0 ? result : null);
                }
            });
        })
    }

    static findByTag(tags){
        return new Promise((resolve , reject) => {
            const query = `
                    SELECT users.username, articles.title, articles.article_id FROM tags
                    JOIN articles ON articles.article_id = tags.article_id
                    JOIN users ON articles.id = users.id
                    WHERE tagName in (?)
                    GROUP BY tags.article_id
                `
            conn.query(
                query,
                [tags], (err, result, fields) => {
                    if(err)
                        return reject(err)
                    else if (result.length == 0)
                        return resolve(null)
                    else {
                        return resolve(result)
                    }
                }
            )
        })  
    }

    static hasRated(user_id, article_id){
        return new Promise((resolve , reject) => {
            const query = `
                    SELECT * FROM votes WHERE id = ? AND article_id = ?
                `
            conn.query(
                query,
                [user_id, article_id], (err, result, fields) => {
                    if(err)
                        return reject(err)
                    else if (result.length == 0)
                        return resolve(-1)
                    else {
                        return resolve(result[0].value)
                    }
                }
            )
        });
    }
}


module.exports = ArticleModel;
