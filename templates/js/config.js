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
        driver: "mysql",
        host: "127.0.0.1",
        port: "3306",
        username: "test",
        password: "test",
        database: "test" //, pool : true
    }
};