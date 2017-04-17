var express = require('express');
var router = express.Router();
var monk = require('monk');
var db = monk('localhost:27017/OnlineBloggingSPAWebApp');

var blogs = db.get('blogs');

router.get('/blogs', function(req, res) {
    blogs.find({}, function(err, blogs) {
        if (err) throw err;
        console.log(blogs);
        res.json(blogs);
    });
});

router.post('/blogs', function(req, res) {
    console.log(req.body);
    var new_blog = req.body;
    new_blog.posts = [];
    new_blog.rating = 0;
    new_blog.ratedviewers = 0;
    new_blog.postid_counter = 0;

    blogs.insert(new_blog, function(err) {
        if (err) throw err;
        res.send("Success");
    });
});

router.get('/blogs/:blogid', function(req, res) {
    blogs.findOne({ _id: req.params.blogid }, function(err, blog) {
        if (err) throw err;
        console.log(blog);
        res.json(blog);
    });
});

router.post('/blogs/:blogid', function(req, res) {
    var new_post = req.body;
    new_post.postid = '';
    blogs.findOne({ _id: req.params.blogid }, function(err, blog) {
        if (err) throw err;
        new_post.postid = blog.postid_counter + 1;
        blogs.update({ _id: req.params.blogid }, { $push: { posts: new_post }, $set: { postid_counter: new_post.postid } }, function(err) {
            if (err) throw err;
            console.log('hello');
            console.log(req.body);
            res.send('success');
        });
    });

});

router.delete('/blogs/:blogid', function(req, res) {
    blogs.remove({ _id: req.params.blogid }, function(err) {
        if (err) throw err;
        res.send('Success');
    });
});

router.delete('/blogs/:blogid/:postid', function(req, res) {
    blogs.update({ _id: req.params.blogid }, { $pull: { posts: { postid: parseInt(req.params.postid) } } }, function(err, data) {
        if (err) throw error;
        res.send('success');
    });
});

router.put('/blogs/:blogid', function(req, res) {
    var user_rating = req.body.user_rating;
    blogs.findOne({ _id: req.params.blogid }, function(err, blog) {
        if (err) throw err;
        var blog_rating = blog.rating;
        var rated_viewers_count = blog.ratedviewers;
        blog_rating = (blog_rating * rated_viewers_count + parseInt(user_rating)) / (rated_viewers_count + 1);

        rated_viewers_count += 1;

        blogs.update({ _id: req.params.blogid }, { $set: { rating: blog_rating, ratedviewers: rated_viewers_count } }, function(err) {
            if (err) throw err;
            res.send('success');
        });
    });
});
module.exports = router;