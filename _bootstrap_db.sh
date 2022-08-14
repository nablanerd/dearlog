rm /Users/julienhimmer/Documents/_POLE/SI/_sandbox/js/dearlog/db/database-dev.sqlite3

./node_modules/sequelize-cli/lib/sequelize db:migrate:undo:all
./node_modules/sequelize-cli/lib/sequelize db:migrate
./node_modules/sequelize-cli/lib/sequelize db:seed:undo:all
./node_modules/sequelize-cli/lib/sequelize db:seed:all
