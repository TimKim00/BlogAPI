// const chai = require('chai');
// const chaiHttp = require('chai-http');

// require('dotenv');

// const server =  process.env.SERVER_ADDRESS;

// chai.should();
// chai.use(chaiHttp);

// describe('E2E tests for user management', () => {
//     let user1Token = '';
//     let user2Token = '';

//     it('Should register user1', (done) => {
//         const user1 = {
//             username: 'user1',
//             password: 'password1',
//         };

//         chai.request(server)
//             .post('/register')
//             .send(user1)
//             .end((err, res) => {
//                 res.should.have.status(200);
//                 res.body.should.be.a('object');
//                 res.body.should.have.property('accessToken');
//                 user1Token = res.body.accessToken;
//                 done();
//             });
//     });

//     it('Should register user2', (done) => {
//         const user2 = {
//             username: 'user2',
//             password: 'password2',
//         };

//         chai.request(server)
//             .post('/register')
//             .send(user2)
//             .end((err, res) => {
//                 res.should.have.status(200);
//                 res.body.should.be.a('object');
//                 res.body.should.have.property('accessToken');
//                 user2Token = res.body.accessToken;
//                 done();
//             });
//     });

//     it('User1 should not be able to remove User2', (done) => {
//         chai.request(server)
//             .post('/removeUser')
//             .set('Authorization', `Bearer ${user1Token}`)
//             .send({username: 'user2'})
//             .end((err, res) => {
//                 res.should.have.status(401);
//                 done();
//             });
//     });
// });
