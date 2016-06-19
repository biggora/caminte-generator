[![Dependency Status](https://gemnasium.com/biggora/caminte-generator.png)](https://gemnasium.com/biggora/caminte-generator)
[![NPM version](https://badge.fury.io/js/caminte-generator.png)](http://badge.fury.io/js/caminte-generator)
## CaminteJS RestFul server

  Fast, unopinionated, minimalist restful server for [node](http://nodejs.org/) and [express](http://expressjs.com/) based on [caminte orm](http://www.camintejs.com/).

### CaminteJS ORM db adapters:
    mysql, sqlite3, postgres, mongodb, redis, riak, couchdb(nano), rethinkdb, tingodb

<table>
    <tr>
      <td><img width="100" src="https://github.com/biggora/caminte/raw/master/media/memory.png"/></td>
      <td><img width="100" src="https://github.com/biggora/caminte/raw/master/media/mongodb.png"/></td>
      <td><img width="100" src="https://github.com/biggora/caminte/raw/master/media/mysql.png"/></td>
      <td><img width="100" src="https://github.com/biggora/caminte/raw/master/media/postgresql.png"/></td>
      <td><img width="100" src="https://github.com/biggora/caminte/raw/master/media/sqlite.png"/></td>
      <td><img width="100" src="https://github.com/biggora/caminte/raw/master/media/mariadb.png"/></td>
      <td><img width="100" src="https://github.com/biggora/caminte/raw/master/media/firebird.png"/></td>   
    </tr>
    <tr>
      <td><img width="100" src="https://github.com/biggora/caminte/raw/master/media/couchdb.png"/></td>
      <td><img width="100" src="https://github.com/biggora/caminte/raw/master/media/rethinkdb.png"/></td>
      <td><img width="100" src="https://github.com/biggora/caminte/raw/master/media/redis.png"/></td> 
      <td><img width="100" src="https://github.com/biggora/caminte/raw/master/media/tingodb.png"/></td>      
      <td><img width="100" src="https://github.com/biggora/caminte/raw/master/media/neo4j.png"/></td> 
      <td><img width="100" src="https://github.com/biggora/caminte/raw/master/media/arangodb.png"/></td>
      <td><img width="100" src="https://github.com/biggora/caminte/raw/master/media/cassandra.png"/></td>
    </tr>
</table>

## Installation

    $ npm install -g caminte-generator

## Quick Start

 The quickest way to get started with caminte is to utilize the executable `caminte(1)` to generate an application as shown below:

 Create the app:

    $ npm install -g caminte-generator
    $ caminte -i test && cd ./test

 Install dependencies:

    $ npm install

 Edit `./config/index.js` file, to configure the connection to the database server.

 Create model:

    $ caminte -g User name email password desciption:text created:date

 Run server:

    $ caminte -s

#### Calling a REST server with Command Line cURL

 Create User:

    $ curl -X POST http://localhost:3000/v1/users -i -H "Content-type: application/json" -d "{\"name\":\"Alex Gora\",\"created\":\"2014-01-01\"}"
    # or
    $ curl -X POST http://localhost:3000/v1/users -i -d "name=Alex%20Gora&created=2014-01-01"
 
 Update User:
 
    $ curl -X PUT http://localhost:3000/v1/users/1 -i -H "Content-type: application/json" -d "{\"pass\":\"6r87uyfGFTg\",\"email\":\"example@example.com\"}"
    # or
    $ curl -X PUT http://localhost:3000/v1/users/1 -i -d "pass=6r87uyfGFTg&email=example@example.com"

 Get Users:

    $ curl -X GET http://localhost:3000/v1/users -i -H "Content-type: application/json" -d "{\"skip\":\"0\",\"limit\":\"10\",\"sort\":\"id:desc\"}" 
    # or
    $ curl -X GET http://localhost:3000/v1/users -i -d "skip=0&limit=10&sort=id:desc" 

 Delete User:

    $ curl -X DELETE http://localhost:3000/v1/users/1 -i

 Search:
    
    $ curl -X GET http://localhost:3000/v1/users -i -H "Content-type: application/json"  -d "{\"search\":\"name:alex\"}"
    # or
    $ curl -X GET http://localhost:3000/v1/users -i -d "search=name:alex" 

### Usage

    $ caminte [options] [dir]

### Options

    -h, --help                  output usage information
    -V, --version               output the version number
    -i, --init <appname>        create caminte application
    -g, --generate <modelname]  generate data model
    -s, --server                runs caminte server
    -a, --adapter               database adapter (mysql|redis|etc...)
    -j, --jade                  add jade engine support (defaults to ejs)
    -H, --hogan                 add hogan.js engine support
    -c, --css <engine>          add css <engine> support (less|stylus|compass) (defaults to plain css)
    -f, --force                 force on non-empty directory

### Examples

    # create new restful application
    $ caminte -i Test -a mysql -j

    # create model
    $ caminte -g Post active:bool name:string desc:text created:date

### Routes

will provide the following routes:

    method        route                    action 
    ------------------------------------------------------------
    GET           /v1/:table                  index      
    GET           /v1/:table/:id              show       
    POST          /v1/:table                  create    
    PUT           /v1/:table/:id              update      
    DELETE        /v1/:table/:id              destroy    
    DELETE        /v1/:table                  destroyall  

### Directory structure

On initialization directories tree generated, like that:

    .
    |-- bin
    |   `-- www
    |-- config
    |   `-- index.js
    |-- lib
    |   |-- inflection.js
    |   |-- tools.js
    |   `-- xml.js
    |-- models
    |   `-- User.js
    |-- public
    |   |-- css
    |   |   `-- ...
    |   |-- js
    |   |   `-- ...
    |   `-- img
    |       `-- ...
    |-- test
    |   |-- routes
    |   |   `-- ...
    |   |-- models
    |   |   `-- ...
    |   `-- units
    |       `-- ...
    |-- app.js
    `-- package.json



### Recommend extensions

- [TrinteJS](http://www.trintejs.com/) - Javascrpt MVC Framework for Node.JS
- [CaminteJS](http://www.camintejs.com/) - Cross-db ORM for NodeJS
- [2CO](https://github.com/biggora/2co) - is the module that will provide nodejs adapters for 2checkout API payment gateway.

## License

(The MIT License)
 
Copyright (c) 2014 Aleksej Gordejev &lt;aleksej@gordejev.lv&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

## Resources

- Visit the [author website](http://www.gordejev.lv).
- Follow [@biggora](https://twitter.com/#!/biggora) on Twitter for updates.
- Report issues on the [github issues](https://github.com/biggora/caminte-generator/issues) page.

[![Analytics](https://ga-beacon.appspot.com/UA-22788134-5/caminte-generator/readme)](https://github.com/igrigorik/ga-beacon) [![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/biggora/caminte-generator/trend.png)](https://bitdeli.com/free "Bitdeli Badge")