var app = angular.module('OnlineBlogging', ['ngResource', 'ngRoute']);

app.config(['$routeProvider', function($routeProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'partials/home.html',
            controller: 'HomeCtrl'
        })
        .when('/blogs/:blogid', {
            templateUrl: 'partials/blog.html',
            controller: 'BlogCtrl'
        })
        .otherwise({
            templateUrl: 'partials/blog.html',
            controller: 'BlogCtrl'
        });
}]);


app.controller('HomeCtrl', ['$scope', '$resource', '$location', '$routeParams',
    function($scope, $resource, $location) {
        var blogs_endpoint = $resource('/api/blogs');
        var loadBlogs = function() {
            blogs_endpoint.query(function(blogs) {
                $scope.blogs = blogs;
            });
        }
        loadBlogs();
        $scope.new_blog = {};
        $scope.createBlog = function() {
            blogs_endpoint.save($scope.new_blog, function() {
                $scope.new_blog = {};
                loadBlogs();
                $location.path('/');
            });
        }


        var delete_blog_endpoint = $resource('/api/blogs/:blogid');
        $scope.selected_blog = '';
        $scope.deleteBlog = function(blog) {
            delete_blog_endpoint.delete({ blogid: blog._id }, function() {
                $location.path('/');
            });
        };

        $scope.viewBlog = function(blog) {
            $location.path('/blogs/' + blog._id);
        };
    }
]);

app.controller('BlogCtrl', ['$scope', '$resource', '$location', '$routeParams',
    function($scope, $resource, $location, $routeParams) {
        var blog_endpoint = $resource('/api/blogs/:blogid');
        var getBlog = function() {
            blog_endpoint.get({ blogid: $routeParams.blogid }, function(blog) {
                $scope.current_blog = blog;
            });
        };

        getBlog();
        $scope.user_rating = 0;

        $scope.new_post = {};
        $scope.createPost = function() {
            blog_endpoint.save({ blogid: $routeParams.blogid }, $scope.new_post, function() {
                $scope.new_post = {};
                getBlog();
            });
        };

        var blog_post_endpoint = $resource('/api/blogs/:blogid/:postid');
        $scope.deletePost = function(post) {
            blog_post_endpoint.delete({ blogid: $scope.current_blog._id, postid: post.postid }, function() {
                getBlog();
            });
        };

        $scope.rateBlog = function() {
            var endpoint = $resource('/api/blogs/:blogid', { blogid: $scope.current_blog._id }, { 'updateRating': { method: 'PUT' } });
            endpoint.updateRating({ user_rating: $scope.user_rating }, function() {
                getBlog();
            });
        };
    }
]);