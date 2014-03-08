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
        host: "192.168.56.101",
        port: "3306",
        username: "biggora",
        password: "09091234",
        database: "phpmyadmin" //, pool : true
    }
};