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

    it('User 1 Should remove user 1.', (done) => {
        const user1 = {
            username: 'user1'
        };

        chai.request(server)
            .post('/auth/removeUser')
            .set('Authorization', `Bearer ${new_user1Token}`)
            .send(user1)
            .end((err, res) => {
                res.should.have.status(204);
                res.body.should.be.a('object');
                done();
            });
    });

    it('User 2 Should remove user 2.', (done) => {
        const user2 = {
            username: 'user2'
        };

        chai.request(server)
            .post('/auth/removeUser')
            .set('Authorization', `Bearer ${user2Token}`)
            .send(user2)
            .end((err, res) => {
                res.should.have.status(204);
                res.body.should.be.a('object');
                done();
            });
    });
});

describe('Unit tests for post management (CRUD)', () => {
    let user1Token = '';
    let user1Id = '';
    let user2Token = '';
    let user2Id = '';
    let post1Id = '';
    let post2Id = '';

    Utils.clearUser();
    Utils.clearPosts();

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
                res.body.should.have.property('userInfo');
                res.body.userInfo.should.have.property('userId');
                user1Token = res.body.accessToken;
                user1Id = res.body.userInfo.userId;
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
                res.body.should.have.property('userInfo');
                res.body.userInfo.should.have.property('userId');
                user2Token = res.body.accessToken;
                user2Id = res.body.userInfo.userId;
                done();
            });
    });

    it('User1 Should create post', (done) => {
        const postInfo = {
            userId: user1Id,
            title: 'title',
            content: 'content'
        };

        chai.request(server)
            .post('/posts/create')
            .set('Authorization', `Bearer ${user1Token}`)
            .send(postInfo)
            .end((err, res) => {
                res.should.have.status(201);
                res.body.should.be.a('object');
                res.body.should.have.property('postInfo');
                res.body.postInfo.should.have.property('postId');
                post1Id = res.body.postInfo.postId;
                done();
            });
    });

    it('User1 Should view post', (done) => {
        chai.request(server)
            .get(`/posts/view/${post1Id}`)
            .set('Authorization', `Bearer ${user1Token}`)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('postInfo');
                done();
            });
    });

    it('User2 Should view post', (done) => {
        chai.request(server)
            .get(`/posts/view/${post1Id}`)
            .set('Authorization', `Bearer ${user2Token}`)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('postInfo');
                done();
            });
    });

    it('User2 Should not update post', (done) => {
        const updatedInfo = {
            title: "newTitle",
            content: "newContent"
        }

        chai.request(server)
            .put(`/posts/update/${post1Id}`)
            .set('Authorization', `Bearer ${user2Token}`)
            .send(updatedInfo)
            .end((err, res) => {
                res.should.have.status(401);
                done();
            });
    });
    
    it('User1 Should update post', (done) => {
        const updatedInfo = {
            title: "newTitle",
            content: "newContent"
        }

        chai.request(server)
            .put(`/posts/update/${post1Id}`)
            .set('Authorization', `Bearer ${user1Token}`)
            .send(updatedInfo)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('postInfo');
                res.body.postInfo.title.should.equal("newTitle");
                res.body.postInfo.content.should.equal("newContent");
                done();
            });
    });

    it('User2 Should not remove post', (done) => {
        chai.request(server)
            .delete(`/posts/remove/${post1Id}`)
            .set('Authorization', `Bearer ${user2Token}`)
            .end((err, res) => {
                res.should.have.status(400);
                done();
            });
    });

    it('User1 Should remove post', (done) => {
        chai.request(server)
            .delete(`/posts/remove/${post1Id}`)
            .set('Authorization', `Bearer ${user1Token}`)
            .end((err, res) => {
                res.should.have.status(200);
                done();
            });
    });
});



describe('Unit tests for admin access', () => {
    let adminToken = '';
    let userToken = '';

    Utils.clearUser();

    it('Should register admin', (done) => {
        const admin = {
            username: 'admin',
            password: 'adminPW',
            admin: 'true'
        };

        chai.request(server)
            .post('/auth/register')
            .send(admin)
            .end((err, res) => {
                res.should.have.status(201);
                res.body.should.be.a('object');
                res.body.should.have.property('accessToken');
                adminToken = res.body.accessToken;
                done();
            });
    });

    it('Should register user', (done) => {
        const user = {
            username: 'user',
            password: 'userPW',
        };

        chai.request(server)
            .post('/auth/register')
            .send(user)
            .end((err, res) => {
                res.should.have.status(201);
                res.body.should.be.a('object');
                res.body.should.have.property('accessToken');
                userToken = res.body.accessToken;
                done();
            });
    });
});