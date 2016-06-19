/**
 *  Application config
 *
 *  Created by create model script
 *  App based on CaminteJS
 *  CaminteJS homepage http://www.camintejs.com
 **/

module.exports = {
    port : 3000,
    debug : false,
    autoupdate : true,    
    db: {
        production: {
            driver: "{driver}",
            host: "127.0.0.1",
            port: "{port}",
            // username: "test",
            // password: "test",
            database: "{database}" //, pool : true
        },
        development: {
            driver: "{driver}",
            host: "127.0.0.1",
            port: "{port}",
            // username: "test",
            // password: "test",
            database: "{database}_dev"
        },
        test: {
            driver: "{driver}",
            host: "127.0.0.1",
            port: "{port}",
            // username: "test",
            // password: "test",
            database: "{database}_test"
        }
    },
    parser: {
        encoding: "utf-8",
        keepExtensions: true,
        uploadDir: __dirname + '/../uploads'
    }
};