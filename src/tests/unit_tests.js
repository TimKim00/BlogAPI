const chai = require('chai');
const chaiHttp = require('chai-http');
const Utils = require('./test_utils');

require('dotenv').config();

const server =  process.env.SERVER_ADDRESS;

chai.should();
chai.use(chaiHttp);

describe('Unit tests for user management', () => {
    let user1Token = '';
    let user2Token = '';
    let new_user1Token = '';

    Utils.clearUser();

    it('Should register user1', (done) => {
        const user1 = {
            username: 'user1',
            password: 'password1',
        };

        chai.request(server)
            .post('/auth/register')
            .send(user1)
            .end((err, res) => {
                res.should.have.status(201);
                res.body.should.be.a('object');
                res.body.should.have.property('accessToken');
                done();
            });
    });

    it('Should register user2', (done) => {
        const user2 = {
            username: 'user2',
            password: 'password2',
        };

        chai.request(server)
            .post('/auth/register')
            .send(user2)
            .end((err, res) => {
                res.should.have.status(201);
                res.body.should.be.a('object');
                res.body.should.have.property('accessToken');
                done();
            });
    });

    it('Should not register user1 again', (done) => {
        const user1 = {
            username: 'user1',
            password: 'password2',
        };

        chai.request(server)
            .post('/auth/register')
            .send(user1)
            .end((err, res) => {
                res.should.have.status(409);
                done();
            });
    });

    it('Should Log In user 1', (done) => {
        const user1 = {
            username: 'user1',
            password: 'password1',
        };

        chai.request(server)
            .post('/auth/login')
            .send(user1)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('accessToken');
                user1Token = res.body.accessToken;
                done();
            });
    });

    it('Should Log In user 1', (done) => {
        const user2 = {
            username: 'user2',
            password: 'password2',
        };

        chai.request(server)
            .post('/auth/login')
            .send(user2)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('accessToken');
                user2Token = res.body.accessToken;
                done();
            });
    });

    it('Should Change password for User 1', (done) => {
        const user1 = {
            username: 'user1',
            old_password: 'password1',
            new_password: 'new_password'
        };

        chai.request(server)
            .put('/auth/changePW')
            .set('Authorization', `Bearer ${user1Token}`)
            .send(user1)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('accessToken');
                new_user1Token = res.body.accessToken;
                done();
            });
    });

    it('User1 Should not log in with old info', (done) => {
        const user1 = {
            username: 'user1',
            password: 'password1',
        };

        chai.request(server)
            .post('/auth/login')
            .send(user1)
            .end((err, res) => {
                res.should.have.status(401);
                done();
            });
    });

    it('User 1 should not authenticate with old token', (done) => {
        const user1 = {
            username: 'user1'
        };

        chai.request(server)
            .post('/auth/removeUser')
            .set('Authorization', `Bearer ${user1Token}`)
            .send(user1)
            .end((err, res) => {
                res.should.have.status(401);
                done();
            });
    });
});
