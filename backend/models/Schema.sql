-- Users table (for reference)
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(255) UNIQUE,
    email VARCHAR(255) UNIQUE,
    passwordHash VARCHAR(255),
    active BOOLEAN
);

-- Articles table
CREATE TABLE articles (
    article_id VARCHAR(36) PRIMARY KEY,
    id VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) UNIQUE,
    content TEXT
);

-- References table
CREATE TABLE references_table (
    article_id VARCHAR(36) REFERENCES articles(article_id) ON DELETE CASCADE,
    to_article_id VARCHAR(36) REFERENCES articles(article_id) ON DELETE CASCADE,
    PRIMARY KEY (article_id, to_article_id),
    CHECK (article_id <> to_article_id)
);

-- Votes table
CREATE TABLE votes (
    article_id VARCHAR(36) REFERENCES articles(article_id) ON DELETE CASCADE,
    id VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE,
    value BOOLEAN,
    PRIMARY KEY (article_id, id)
);

-- Tags table
CREATE TABLE tags (
    article_id VARCHAR(36) REFERENCES articles(article_id) ON DELETE CASCADE,
    tagName VARCHAR(100),
    PRIMARY KEY (article_id, tagName)
);