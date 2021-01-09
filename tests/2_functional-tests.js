const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

let id1 = ''
let id2 = ''

suite('Functional Tests', function() {

  suite('POST /api/issues/{project} => object with issue data',function() {

    test('Every field filled in', function(done) {
      chai.request(server)
      .post('/api/issues/test')
      .send({
        issue_title: 'Title',
        issue_text: 'text',
        created_by: 'Functional Test - Every field filled in',
        assigned_to: 'Chai and Mocha',
        status_text: 'In QA'
      })
      .end(function(err, res){
        assert.equal(res.status, 200);
        assert.equal(res.body.issue_title, 'Title')
        assert.equal(res.body.issue_text, 'text')
        assert.equal(res.body.created_by, 'Functional Test - Every field filled in');
        assert.equal(res.body.assigned_to, 'Chai and Mocha');
        assert.equal(res.body.status_text, 'In QA');
        assert.equal(res.body.project, 'test');
        id1 = res.body._id
        console.log('id 1 has been set as ' + 'id1')
        done();
      })
    })

    test('Required fields filled in', function(done){
      chai.request(server)
      .post('/api/issues/test')
      .send({
        issue_title: 'Title 2',
        issue_text: 'text',
        created_by: 'Functional Test - Every field filled in',
      })
      .end(function(err, res){
        assert.equal(res.status, 200);
        assert.equal(res.body.issue_title, 'Title')
        assert.equal(res.body.issue_text, 'text')
        assert.equal(res.body.created_by, 'Functional Test - Every field filled in');
        assert.equal(res.body.assigned_to, '');
        assert.equal(res.body.status_text, '');
        assert.equal(res.body.project, 'test');
        id2 = res.body._id
        console.log('id 2 has been set as ' + 'id2')
        done();
      })
    })

    test('Missing required fields', function)(done){
      chai.request(server)
        .post('/api/issues/test')
        .send({
          issue_title: 'Title'
        })
        .end(function(err,res){
          assert.equal(res.body, 'Required fields missing from request')
          done()
        })
    }
  })
  
});
