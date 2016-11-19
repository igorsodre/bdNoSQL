// app/routes.js

// load the todo model
var Todo = require('./models/todo');
var Promise = require('promise');
//var MD5 = require('md5');
// expose the routes to our app with module.exports
module.exports = function (app) {

    // api ---------------------------------------------------------------------
    // get all todos
    app.get('/api/todos', function (req, res) {

        // use mongoose to get all todos in the database
        Todo.find(function (err, todos) {

            // if there is an error retrieving, send the error. nothing after res.send(err) will execute
            if (err) {
                res.send(err);
            }

            res.json(todos); // return all todos in JSON format
        });
    });

    app.get('/api/coisa', function (req, res) {
        console.log(req.query);
        Object.keys(req.query).forEach(function (key) {
            app.redisClient.set(key, req.query[key]);
        })
        res.send('ok');
    });

    app.get('/api/catacoisa', function (req, res) {
        var novoOb = {};
        app.redisClient.keys('*', function (err, keys) {
            if (err) {
                res.send('nao ok');
            } else {
                var novoOb = {};
                var promArr = new Array();
                if (keys != null) {
                    for (var count in keys) {
                        promArr.push(new Promise(function (resolve, reject) {
                            app.redisClient.get(keys[count], function (err, data) {
                                resolve(data);
                            });
                        }))
                    }
                    Promise.all(promArr).then(function (values) {
                        for (var count in keys) {
                            novoOb[keys[count]] = values[count];
                        }
                        console.log(novoOb);
                        res.json(novoOb);
                    });
                }
                //app.redisClient.get(keys,function(err,values){});
            }
        });
    });
    app.get('/api/getdonetodos', function (req, res) {
        var result = [];
        var promArr = [];
        app.redisClient.keys("donetask*", function (err, data) {
            data.forEach(function (key) {
                promArr.push(new Promise(function (resolve, reject) {
                    app.redisClient.hgetall(key, function (err, value) {
                        result.push(value);
                        resolve();
                    });
                }));
            });
            Promise.all(promArr).then(function (values) {
                res.json(result);
            });
        });

    });

    /*app.post('/api/createdonetodo', function () {
      var todo_id = "donetask"+req.params._id;
      var data = {
        text:req.params.text,
        status:"done",
        type:"TODO"
      }
      app.redisClient.hmset(todo_id,data);

    });*/
    // create todo and send back all todos after creation
    app.post('/api/todos', function (req, res) {

        // create a todo, information comes from AJAX request from Angular
        Todo.create({
                text: req.body.text,
                done: false
            },

            function (err, todo) {
                if (err) {
                    console.log("deu erro\n");
                    console.log(err.toString());
                    res.send(err);
                }
                else {

                    // get and return all the todos after you create another
                    Todo.find(function (err, todos) {
                        if (err) {
                            res.send(err);
                        } else {
                            res.json(todos);
                        }
                    });
                }
            });

    });

    // delete a todo
    app.delete('/api/todos/:todo_id', function (req, res) {
        Todo.find({_id: req.params.todo_id}, function (err, data) {
            if (!err) {
                console.log(data);
                app.redisClient.hmset("donetask" + data[0]._id, {
                    "text": data[0].text,
                    "status": "done",
                    "type": "TODO",
                    "key": "donetask" + data[0]._id
                });
                Todo.remove({
                    _id: req.params.todo_id
                }, function (err, todo) {
                    if (err) {
                        res.send(err);
                    }

                    // get and return all the todos after you create another
                    Todo.find(function (err, todos) {
                        if (err) {
                            res.send(err);
                        } else {
                            res.json(todos);
                        }
                    });
                });
            }
        });

    });

    app.delete('/api/deletedonetodos/:donetodo_key', function (req, res) {
        console.log(req.params.donetodo_key);
        app.redisClient.del(req.params.donetodo_key, function (err, log) {
            if (err) {
                console.log(err);
                res.send(err);
            } else {
                res.json(log);
            }
        });
    });
};
