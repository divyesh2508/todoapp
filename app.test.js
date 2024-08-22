const request = require('supertest');
const chai = require('chai');
const expect = chai.expect;
const mongoose = require('mongoose');
const app = require('./app'); // adjust the path to your app.js file

describe('Todo API', function() {
    before(function(done) {
        mongoose.connect("mongodb://admin:admin@13.200.160.5:28018/", {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }, done);
    });

    // Test the GET / route
    it('should return 200 and render the index page', function(done) {
        request(app)
            .get('/')
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                done();
            });
    });

    // Test the POST /newtodo route
    it('should create a new todo', function(done) {
        request(app)
            .post('/newtodo')
            .send({ task: 'Test Task' })
            .expect(302) // Redirect
            .end((err, res) => {
                if (err) return done(err);
                done();
            });
    });

    // Test the GET /delete/:id route
    it('should delete a todo', function(done) {
        // First, create a new todo to delete
        const newTodo = new Todo({
            name: 'Task to delete'
        });
        newTodo.save().then((todo) => {
            request(app)
                .get(`/delete/${todo._id}`)
                .expect(302) // Redirect
                .end((err, res) => {
                    if (err) return done(err);
                    done();
                });
        });
    });

    // Test the POST /delAlltodo route
    it('should delete all todos', function(done) {
        request(app)
            .post('/delAlltodo')
            .expect(302) // Redirect
            .end((err, res) => {
                if (err) return done(err);
                done();
            });
    });

    // Test the invalid GET request route
    it('should return 200 and render the invalid page', function(done) {
        request(app)
            .get('/invalid-route')
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.text).to.contain('Invalid Page');
                done();
            });
    });

    after(function(done) {
        mongoose.connection.close(done);
    });
});
