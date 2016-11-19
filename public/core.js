// public/core.js
var bogoTodo = angular.module('bogoTodo', []);

function mainController($scope, $http) {
    $scope.formData = {};
    $scope.doneTodos = [];

    // when landing on the page, get all todos and show them
    $http.get('/api/todos')
        .success(function (data) {
            $scope.todos = data;
            console.log(data);
        })
        .error(function (data) {
            console.log('Error: ' + data);
        });

    $http.get('/api/getdonetodos').success(function (data) {
        $scope.doneTodos = data;
        console.log(data);
    }).error(function (data) {
        console.log('Error: ' + data);
    });

    // when submitting the add form, send the text to the node API
    $scope.createTodo = function () {
        $http.post('/api/todos', $scope.formData)
            .success(function (data) {
                $scope.formData = {}; // clear the form so our user is ready to enter another
                $scope.todos = data;
            })
            .error(function (data) {
                console.log('Error: ' + data);
            });
    };

    // delete a todo after checking it
    $scope.deleteTodo = function (id) {
        $http.delete('/api/todos/' + id)
            .success(function (data) {
                $scope.todos = data;
                $http.get('/api/getdonetodos').success(function (data) {
                    $scope.doneTodos = data;
                }).error(function (data) {
                    console.log('Error: ' + data);
                });
            })
            .error(function (data) {
                console.log('Error: ' + data);
            });
    };

    $scope.deleteTodoRedis = function (donetodo_key) {
        $http.delete('/api/deletedonetodos/' + donetodo_key).success(function (data) {
            console.log('cheguei motherfucker do delete');
            $http.get('/api/getdonetodos').success(function (data) {
                $scope.doneTodos = data;
                console.log(data);
            }).error(function (data) {
                console.log('Error: ' + data);
            });

        }).error(function (err) {
            console.log(err);
        });

    }
}