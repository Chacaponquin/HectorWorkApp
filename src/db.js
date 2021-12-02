let Datastore = require("nedb");

const db = new Datastore({ filename: "db/works.db", autoload: true });

db.loadDatabase((err) => {
    //console.log(err);
});

module.exports = db;