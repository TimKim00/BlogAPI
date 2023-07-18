const chai = require('chai');
const chaiHttp = require('chai-http');
const Utils = require('../utils/utils');
const TestUtils = require('../utils/test_utils');
const { displayLimit } = require('../models/post');

require('dotenv').config();

const server = process.env.SERVER_ADDRESS;

chai.should();
chai.use(chaiHttp);

const searchLimit = displayLimit;

describe('Unit tests for user management', () => {
    let user1Token = '';
    let user2Token = '';
    let new_user1Token = '';

    it('should clear database', async function() {
        await Utils.clearDataBase();
    });

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
            .delete('/auth/removeUser')
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
            .delete('/auth/removeUser')
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
            .delete('/auth/removeUser')
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

    it('should clear database', async function() {
        await Utils.clearDataBase();
    });

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
            .post('/posts')
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
            .get(`/posts/${post1Id}`)
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
            .get(`/posts/${post1Id}`)
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
            .put(`/posts/${post1Id}`)
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
            .put(`/posts/${post1Id}`)
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
            .delete(`/posts/${post1Id}`)
            .set('Authorization', `Bearer ${user2Token}`)
            .end((err, res) => {
                res.should.have.status(400);
                done();
            });
    });

    it('User1 Should remove post', (done) => {
        chai.request(server)
            .delete(`/posts/${post1Id}`)
            .set('Authorization', `Bearer ${user1Token}`)
            .end((err, res) => {
                res.should.have.status(200);
                done();
            });
    });
});

describe('Unit tests for comment features1', () => {
    let user1Token = '';
    let user1Id = '';
    let user2Token = '';
    let user2Id = '';
    let post1Id = '';
    let post2Id = '';
    let commentId = '';
    let allComments = new Array();

    it('should clear database', async function () {
        await Utils.clearDataBase();
    });

    it('Should register user1', (done) => {
        const user = {
            username: 'user1',
            password: 'userPW1',
        };

        chai.request(server)
            .post('/auth/register')
            .send(user)
            .end((err, res) => {
                res.should.have.status(201);
                res.body.should.be.a('object');
                res.body.should.have.property('accessToken');
                res.body.should.have.property('userInfo');
                user1Id = res.body.userInfo.userId;
                user1Token = res.body.accessToken;
                done();
            });
    });

    it('Should register user2', (done) => {
        const user = {
            username: 'user2',
            password: 'userPW2',
        };

        chai.request(server)
            .post('/auth/register')
            .send(user)
            .end((err, res) => {
                res.should.have.status(201);
                res.body.should.be.a('object');
                res.body.should.have.property('accessToken');
                res.body.should.have.property('userInfo');
                user2Id = res.body.userInfo.userId;
                user2Token = res.body.accessToken;
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
            .post('/posts')
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

    it('User 2 Should comment', (done) => {
        const commentInfo = {
            userId: user2Id,
            postId: post1Id,
            isPrivate: false,
            content: 'commentByUser2'
        };

        chai.request(server)
            .post(`/posts/${post1Id}/comments`)
            .set('Authorization', `Bearer ${user2Token}`)
            .send(commentInfo)
            .end((err, res) => {
                res.should.have.status(201);
                res.body.should.be.a('object');
                res.body.should.have.property('commentInfo');
                res.body.commentInfo.should.have.property('commentId');
                commentId = res.body.commentInfo.commentId;
                allComments.push(commentId);
                done();
            });
    });

    it('User 1 Should replay on User2', (done) => {
        const commentInfo = {
            userId: user1Id,
            postId: post1Id,
            isPrivate: false,
            content: 'replyByUser1',
            headId: commentId
        };

        chai.request(server)
            .post(`/posts/${post1Id}/comments`)
            .set('Authorization', `Bearer ${user1Token}`)
            .send(commentInfo)
            .end((err, res) => {
                res.should.have.status(201);
                res.body.should.be.a('object');
                res.body.should.have.property('commentInfo');
                res.body.commentInfo.should.have.property('commentId');
                commentId = res.body.commentInfo.commentId;
                allComments.push(commentId);
                done();
            });
    });

    it('User 2 Should replay on User1\'s reply', (done) => {
        const commentInfo = {
            userId: user2Id,
            postId: post1Id,
            isPrivate: false,
            content: 'replyByUser2',
            headId: commentId
        };

        chai.request(server)
            .post(`/posts/${post1Id}/comments`)
            .set('Authorization', `Bearer ${user2Token}`)
            .send(commentInfo)
            .end((err, res) => {
                res.should.have.status(201);
                res.body.should.be.a('object');
                res.body.should.have.property('commentInfo');
                res.body.commentInfo.should.have.property('commentId');
                commentId = res.body.commentInfo.commentId;
                allComments.push(commentId);
                done();
            });
    });

    it('User 1 Should make new Comment', (done) => {
        const commentInfo = {
            userId: user1Id,
            postId: post1Id,
            isPrivate: false,
            content: 'commmentByUser1'
        };

        chai.request(server)
            .post(`/posts/${post1Id}/comments`)
            .set('Authorization', `Bearer ${user1Token}`)
            .send(commentInfo)
            .end((err, res) => {
                res.should.have.status(201);
                res.body.should.be.a('object');
                res.body.should.have.property('commentInfo');
                res.body.commentInfo.should.have.property('commentId');
                commentId = res.body.commentInfo.commentId;
                allComments.push(commentId);
                done();
            });
    });

    it('User 2 Should view all Comments', (done) => {
        let comments;
        chai.request(server)
            .get(`/posts/${post1Id}/comments`)
            .set('Authorization', `Bearer ${user1Token}`)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('comments');
                comments = res.body.comments;
                TestUtils.checkComments(comments, allComments).should.be.true;
                done();
            });
    });
});

describe('Unit tests for comment features2', () => {
    let user1Token = '';
    let user1Id = '';
    let user2Token = '';
    let user2Id = '';
    let post1Id = '';
    let post2Id = '';
    let commentId = '';
    let allComments = new Array();

    it('should clear database', async function () {
        await Utils.clearDataBase();
    });

    it('Should register user1', (done) => {
        const user = {
            username: 'user1',
            password: 'userPW1',
        };

        chai.request(server)
            .post('/auth/register')
            .send(user)
            .end((err, res) => {
                res.should.have.status(201);
                res.body.should.be.a('object');
                res.body.should.have.property('accessToken');
                res.body.should.have.property('userInfo');
                user1Id = res.body.userInfo.userId;
                user1Token = res.body.accessToken;
                done();
            });
    });

    it('Should register user2', (done) => {
        const user = {
            username: 'user2',
            password: 'userPW2',
        };

        chai.request(server)
            .post('/auth/register')
            .send(user)
            .end((err, res) => {
                res.should.have.status(201);
                res.body.should.be.a('object');
                res.body.should.have.property('accessToken');
                res.body.should.have.property('userInfo');
                user2Id = res.body.userInfo.userId;
                user2Token = res.body.accessToken;
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
            .post('/posts')
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

    it('User 2 Should comment', (done) => {
        const commentInfo = {
            userId: user2Id,
            postId: post1Id,
            isPrivate: false,
            content: 'commentByUser2'
        };

        chai.request(server)
            .post(`/posts/${post1Id}/comments`)
            .set('Authorization', `Bearer ${user2Token}`)
            .send(commentInfo)
            .end((err, res) => {
                res.should.have.status(201);
                res.body.should.be.a('object');
                res.body.should.have.property('commentInfo');
                res.body.commentInfo.should.have.property('commentId');
                commentId = res.body.commentInfo.commentId;
                allComments.push(commentId);
                done();
            });
    });

    it('User 1 Should replay on User2', (done) => {
        const commentInfo = {
            userId: user1Id,
            postId: post1Id,
            isPrivate: false,
            content: 'replyByUser1',
            headId: commentId
        };

        chai.request(server)
            .post(`/posts/${post1Id}/comments`)
            .set('Authorization', `Bearer ${user1Token}`)
            .send(commentInfo)
            .end((err, res) => {
                res.should.have.status(201);
                res.body.should.be.a('object');
                res.body.should.have.property('commentInfo');
                res.body.commentInfo.should.have.property('commentId');
                allComments.push(res.body.commentInfo.commentId);
                done();
            });
    });

    it('User 2 Should replay on User2', (done) => {
        const commentInfo = {
            userId: user2Id,
            postId: post1Id,
            isPrivate: false,
            content: 'replyByUser2',
            headId: commentId
        };

        chai.request(server)
            .post(`/posts/${post1Id}/comments`)
            .set('Authorization', `Bearer ${user2Token}`)
            .send(commentInfo)
            .end((err, res) => {
                res.should.have.status(201);
                res.body.should.be.a('object');
                res.body.should.have.property('commentInfo');
                res.body.commentInfo.should.have.property('commentId');
                commentId = res.body.commentInfo.commentId;
                allComments.push(commentId);
                done();
            });
    });

    it('User 1 Should make new Comment', (done) => {
        const commentInfo = {
            userId: user1Id,
            postId: post1Id,
            isPrivate: false,
            content: 'commmentByUser1'
        };

        chai.request(server)
            .post(`/posts/${post1Id}/comments`)
            .set('Authorization', `Bearer ${user1Token}`)
            .send(commentInfo)
            .end((err, res) => {
                res.should.have.status(201);
                res.body.should.be.a('object');
                res.body.should.have.property('commentInfo');
                res.body.commentInfo.should.have.property('commentId');
                commentId = res.body.commentInfo.commentId;
                allComments.push(commentId);
                done();
            });
    });

    it('User 2 Should view all Comments', (done) => {
        let comments;
        chai.request(server)
            .get(`/posts/${post1Id}/comments`)
            .set('Authorization', `Bearer ${user1Token}`)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('comments');
                comments = res.body.comments;
                TestUtils.checkComments(comments, allComments).should.be.true;
                done();
            });
    });
});

describe('Unit tests for comment features3', () => {
    let user1Token = '';
    let user1Id = '';
    let user2Token = '';
    let user2Id = '';
    let post1Id = '';
    let post2Id = '';
    let commentId = '';
    let allComments = new Array();

    it('should clear database', async function () {
        await Utils.clearDataBase();
    });

    it('Should register user1', (done) => {
        const user = {
            username: 'user1',
            password: 'userPW1',
        };

        chai.request(server)
            .post('/auth/register')
            .send(user)
            .end((err, res) => {
                res.should.have.status(201);
                res.body.should.be.a('object');
                res.body.should.have.property('accessToken');
                res.body.should.have.property('userInfo');
                user1Id = res.body.userInfo.userId;
                user1Token = res.body.accessToken;
                done();
            });
    });

    it('Should register user2', (done) => {
        const user = {
            username: 'user2',
            password: 'userPW2',
        };

        chai.request(server)
            .post('/auth/register')
            .send(user)
            .end((err, res) => {
                res.should.have.status(201);
                res.body.should.be.a('object');
                res.body.should.have.property('accessToken');
                res.body.should.have.property('userInfo');
                user2Id = res.body.userInfo.userId;
                user2Token = res.body.accessToken;
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
            .post('/posts')
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

    it('User 2 Should comment', (done) => {
        const commentInfo = {
            userId: user2Id,
            postId: post1Id,
            isPrivate: false,
            content: 'commentByUser2'
        };

        chai.request(server)
            .post(`/posts/${post1Id}/comments`)
            .set('Authorization', `Bearer ${user2Token}`)
            .send(commentInfo)
            .end((err, res) => {
                res.should.have.status(201);
                res.body.should.be.a('object');
                res.body.should.have.property('commentInfo');
                res.body.commentInfo.should.have.property('commentId');
                commentId = res.body.commentInfo.commentId;
                allComments.push(commentId);
                done();
            });
    });

    it('User 1 Should replay on User2', (done) => {
        const commentInfo = {
            userId: user1Id,
            postId: post1Id,
            isPrivate: false,
            content: 'replyByUser1',
            headId: commentId
        };

        chai.request(server)
            .post(`/posts/${post1Id}/comments`)
            .set('Authorization', `Bearer ${user1Token}`)
            .send(commentInfo)
            .end((err, res) => {
                res.should.have.status(201);
                res.body.should.be.a('object');
                res.body.should.have.property('commentInfo');
                res.body.commentInfo.should.have.property('commentId');
                commentId = res.body.commentInfo.commentId;
                allComments.push(commentId);
                done();
            });
    });

    it('User 1 Should make reply private', (done) => {
        const commentInfo = {
            userId: user1Id,
            postId: post1Id,
            isPrivate: true,
            commentId: commentId,
            content: 'replyByUser1'

        };

        chai.request(server)
            .put(`/posts/${post1Id}/comments`)
            .set('Authorization', `Bearer ${user1Token}`)
            .send(commentInfo)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('commentInfo');
                res.body.commentInfo.should.have.property('commentId');
                commentId = res.body.commentInfo.commentId;
                done();
            });
    });

    it('User 2 Should delete his comment', (done) => {
        const commentInfo = {
            userId: user2Id
        };

        chai.request(server)
            .delete(`/posts/${post1Id}/comments/${allComments[0]}`)
            .set('Authorization', `Bearer ${user2Token}`)
            .send(commentInfo)
            .end((err, res) => {
                res.should.have.status(204);
                done();
            });
    });

    it('User 2 Should not see User1\'s private reply', (done) => {
        chai.request(server)
            .get(`/posts/${post1Id}/comments/${commentId}`)
            .set('Authorization', `Bearer ${user2Token}`)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.have.property('comments');
                chai.expect(res.body.comments.content).to.be.null;
                done();
            });
    });

    it('User 2 Should view all Comments', (done) => {
        let comments;
        chai.request(server)
            .get(`/posts/${post1Id}/comments`)
            .set('Authorization', `Bearer ${user1Token}`)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('comments');
                comments = res.body.comments;
                TestUtils.checkComments(comments, allComments).should.be.true;
                done();
            });
    });
});

describe('Unit tests for invite features', () => {
    let user1Token = '';
    let user1Id = '';
    let user2Token = '';
    let user2Id = '';
    let user3Token = '';
    let user3Id = '';
    let post1Id = '';

    it('should clear database', async function () {
        await Utils.clearDataBase();
    });

    it('Should register user1', (done) => {
        const user = {
            username: 'user1',
            password: 'userPW1',
        };

        chai.request(server)
            .post('/auth/register')
            .send(user)
            .end((err, res) => {
                res.should.have.status(201);
                res.body.should.be.a('object');
                res.body.should.have.property('accessToken');
                res.body.should.have.property('userInfo');
                user1Id = res.body.userInfo.userId;
                user1Token = res.body.accessToken;
                done();
            });
    });

    it('Should register user2', (done) => {
        const user = {
            username: 'user2',
            password: 'userPW2',
        };

        chai.request(server)
            .post('/auth/register')
            .send(user)
            .end((err, res) => {
                res.should.have.status(201);
                res.body.should.be.a('object');
                res.body.should.have.property('accessToken');
                res.body.should.have.property('userInfo');
                user2Id = res.body.userInfo.userId;
                user2Token = res.body.accessToken;
                done();
            });
    });

    it('Should register user3', (done) => {
        const user = {
            username: 'user3',
            password: 'userPW3',
        };

        chai.request(server)
            .post('/auth/register')
            .send(user)
            .end((err, res) => {
                res.should.have.status(201);
                res.body.should.be.a('object');
                res.body.should.have.property('accessToken');
                res.body.should.have.property('userInfo');
                user3Id = res.body.userInfo.userId;
                user3Token = res.body.accessToken;
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
            .post('/posts')
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

    it('User1 Should invite User2 and User3', (done) => {
        const postInfo = {
            invitees: [user2Id, user3Id]
        };

        chai.request(server)
            .post(`/access/${post1Id}`)
            .set('Authorization', `Bearer ${user1Token}`)
            .send(postInfo)
            .end((err, res) => {
                res.should.have.status(201);
                res.body.should.be.a('object');
                res.body.should.have.property('accessInfo');
                let validUsers = [user2Id, user3Id];
                TestUtils.checkAccesses(res.body.accessInfo, validUsers).should.be.true;
                done();
            });
    });

    it('User1 Should not invite User2 and User3 again', (done) => {
        const postInfo = {
            invitees: [user2Id, user3Id]
        };

        chai.request(server)
            .post(`/access/${post1Id}`)
            .set('Authorization', `Bearer ${user1Token}`)
            .send(postInfo)
            .end((err, res) => {
                res.should.have.status(201);
                res.body.should.be.a('object');
                res.body.should.have.property('accessInfo');
                chai.expect(res.body.accessInfo).to.be.null;
                done();
            });
    });

    it('User1 Revoke User2 and User3', (done) => {
        const postInfo = {
            revokeList: [user2Id, user3Id]
        };

        chai.request(server)
            .delete(`/access/${post1Id}`)
            .set('Authorization', `Bearer ${user1Token}`)
            .send(postInfo)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('revokeList');
                let validUsers = [user2Id, user3Id];
                TestUtils.checkAccesses(res.body.revokeList, validUsers).should.be.true;
                done();
            });
    });
});

describe('Unit tests for search features', () => {
    let user1Token = '';
    let user1Id = '';
    let user2Token = '';
    let user2Id = '';
    let postIds = [];

    let startDate = 3;
    let endDate = 48;

    it('should clear database', async function() {
        await Utils.clearDataBase();
    });

    it('Should register user1', (done) => {
        const user = {
            username: 'user1',
            password: 'userPW1',
        };

        chai.request(server)
            .post('/auth/register')
            .send(user)
            .end((err, res) => {
                res.should.have.status(201);
                res.body.should.be.a('object');
                res.body.should.have.property('accessToken');
                res.body.should.have.property('userInfo');
                user1Id = res.body.userInfo.userId;
                user1Token = res.body.accessToken;
                done();
            });
    });

    it('Should register user2', (done) => {
        const user = {
            username: 'user2',
            password: 'userPW2',
        };

        chai.request(server)
            .post('/auth/register')
            .send(user)
            .end((err, res) => {
                res.should.have.status(201);
                res.body.should.be.a('object');
                res.body.should.have.property('accessToken');
                res.body.should.have.property('userInfo');
                user2Id = res.body.userInfo.userId;
                user2Token = res.body.accessToken;
                done();
            });
    });

    it('User1 Should create many posts', async function() {
        this.timeout(5000);
        const postInfoTemplate = {
            userId: user1Id,
            title: 'title',
            content: 'content'
        };
    
        let promises = [];
    
        for (let i = 1; i <= 100; i++) {
            let postInfo = {
                ...postInfoTemplate,
                title: '<'.repeat(i) + 'title' + '>'.repeat(i),
                content: '<'.repeat(i) + 'content' + '>'.repeat(i),
            }
    
            if (i === startDate) {
                startDate = new Date();
            }
            if (i === endDate) {
                endDate = new Date();
            }
    
            let promise = chai.request(server)
                .post('/posts')
                .set('Authorization', `Bearer ${user1Token}`)
                .send(postInfo)
                .then((res) => {
                    res.should.have.status(201);
                    res.body.should.be.a('object');
                    res.body.should.have.property('postInfo');
                    res.body.postInfo.should.have.property('postId');
                    postIds.push(res.body.postInfo.postId);
                });
    
            promises.push(promise);
        }
    
        Promise.all(promises)
        .then(() => done())
        .catch((err) => done(err));

    });
    
    

    it('Should search posts', (done) => {
        const searchInfo = {
            //startDate: startDate,
            //endDate: endDate,
            title: "title",
            content: "content",
            sortBy: "content"
        };

        chai.request(server)
            .get('/search')
            .set('Authorization', `Bearer ${user1Token}`)
            .send(searchInfo)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('searchInfo');
                const searchInfo = res.body.searchInfo;
                done();
            });
    });
});

describe('Unit tests for admin access', () => {
    let userToken = '';
    let userId = '';
    let adminId = '';
    let adminToken = '';
    let postId = '';
    let commentId;

    it('should clear database', async function() {
        await Utils.clearDataBase();
    });

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
                adminId = res.body.userInfo.userId;
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
                userId = res.body.userInfo.userId;
                done();
            });
    });

    it('User Should create post', (done) => {
        const postInfo = {
            userId: userId,
            title: 'title',
            content: 'content'
        };

        chai.request(server)
            .post('/posts')
            .set('Authorization', `Bearer ${userToken}`)
            .send(postInfo)
            .end((err, res) => {
                res.should.have.status(201);
                res.body.should.be.a('object');
                res.body.should.have.property('postInfo');
                res.body.postInfo.should.have.property('postId');
                postId = res.body.postInfo.postId;
                done();
            });
    });

    it('Admin Should create post for User', (done) => {
        const postInfo = {
            userId: userId,
            title: 'title2',
            content: 'content'
        };

        chai.request(server)
            .post('/posts')
            .set('Authorization', `Bearer ${adminToken}`)
            .send(postInfo)
            .end((err, res) => {
                res.should.have.status(201);
                res.body.should.be.a('object');
                res.body.should.have.property('postInfo');
                res.body.postInfo.should.have.property('postId');
                done();
            });
    });

    it('Admin Should update User-created post', (done) => {
        const postInfo = {
            userId: userId,
            title: 'title2',
            content: 'content'
        };

        chai.request(server)
            .put(`/posts/${postId}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send(postInfo)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('postInfo');
                res.body.postInfo.should.have.property('postId');
                done();
            });
    });

    it('User Should create a private comment', (done) => {
        const postInfo = {
            userId: userId,
            title: 'title',
            content: 'content',
            isPrivate: true
        };

        chai.request(server)
            .post(`/posts/${postId}/comments`)
            .set('Authorization', `Bearer ${userToken}`)
            .send(postInfo)
            .end((err, res) => {
                res.should.have.status(201);
                res.body.should.be.a('object');
                res.body.should.have.property('commentInfo');
                res.body.commentInfo.should.have.property('commentId');
                commentId = res.body.commentInfo.commentId;
                done();
            });
    });

    it('Admin Should view the private comment', (done) => {
        chai.request(server)
            .get(`/posts/${postId}/comments/${commentId}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('comments');
                done();
            });
    });

    it('Admin Should delete the private comment', (done) => {
        info = {
            userId : adminId
        }

        chai.request(server)
            .delete(`/posts/${postId}/comments/${commentId}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send(info)
            .end((err, res) => {
                res.should.have.status(204);
                done();
            });
    });

    it('Admin Should delete the post', (done) => {
        info = {
            userId : adminId
        }

        chai.request(server)
            .delete(`/posts/${postId}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send(info)
            .end((err, res) => {
                res.should.have.status(200);
                done();
            });
    });
   
    it('Admin Should delete the User account', (done) => {
        info = {
            username : "user"
        }

        chai.request(server)
            .delete(`/auth/removeUser`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send(info)
            .end((err, res) => {
                res.should.have.status(204);
                done();
            });
    });
});

