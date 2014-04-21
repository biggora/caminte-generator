/**
 *  Application config
 *
 *  Created by create model script
 *  App based on CaminteJS
 *  CaminteJS homepage http://www.camintejs.com
 **/

module.exports = {
    port : 3000,
    debug : true,
    autoupdate : true,
    db: {
        driver: "{driver}",
        host: "127.0.0.1",
        port: "{port}",
        // username: "test",
        // password: "test",
        database: "{database}" //, pool : true
    },
    parser: {
        encoding: "utf-8",
        keepExtensions: true,
        uploadDir: __dirname + '/../uploads'
    }
};