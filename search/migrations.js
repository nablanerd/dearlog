const Sequelize = require('sequelize');

const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];

sequelize = new Sequelize(config.database, config.username, config.password, config);


const virtualTable =
`CREATE VIRTUAL TABLE log_fts USING fts5(
    title, 
    description, 
    content, 
    content='Logs', 
    content_rowid='id' 
);`;

/* 
const triggers = `
CREATE TRIGGER logs_insert AFTER INSERT ON Logs
    BEGIN
        INSERT INTO log_fts (rowid, title, description, content)
        VALUES (new.id, new.title, new.description, new.content);
    END;

CREATE TRIGGER logs_delete AFTER DELETE ON Logs
    BEGIN
        INSERT INTO log_fts (log_fts, rowid, title, description, content)
        VALUES ('delete', old.id, old.title, old.description, old.content);
    END;

CREATE TRIGGER logs_update AFTER UPDATE ON Logs
    BEGIN
        INSERT INTO log_fts (log_fts, rowid, title, description, content)
        VALUES ('delete', old.id, old.title, old.description, old.content);
        INSERT INTO log_fts (rowid, title, description, content)
        VALUES (new.id, new.title, new.description, new.content);
    END;
`
 */

(async () => {
 
    

    const [results1, metadata1] = await sequelize.query(virtualTable);

    //const [results2, metadata2] = await sequelize.query(triggers);


    
  })();

