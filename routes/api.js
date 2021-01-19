'use strict';

var expect = require('chai').expect;
let mongodb = require('mongodb')
let mongoose = require('mongoose')
mongoose.set('useFindAndModify', false);


module.exports = function (app) {

  mongoose.connect(process.env.DB, {useNewUrlParser: true, useUnifiedTopology: true})

  let issueSchema = new mongoose.Schema({
    issue_title: {type: String, required:true},
    issue_text: {type: String, required: true},
    created_by: {type: String, required: true},
    assigned_to: String,
    status_text: String,
    open: {type: Boolean, required: true},
    created_on: {type: Date, required: true},
    updated_on: {type: Date, required: true},
    project: String
  })

  let Issue = mongoose.model('Issue', issueSchema)

  app.route('/api/issues/:project')
  
    .get(function (req, res){
      let project = req.params.project;
      let filterObject = Object.assign(req.query)
      filterObject['project'] = project
      Issue.find(
        filterObject,
        (error,arrayOfResults) => {
          if(!error && arrayOfResults){
            return res.json(arrayOfResults)
          }
        }
      )
    })
    
    .post(function (req, res){
      let project = req.params.project;

      if(!req.body.issue_title || !req.body.issue_text || !req.body.created_by){
        return res.json({error: 'required field(s) missing' })
      }


      let newIssue = new Issue({
        issue_title: req.body.issue_title,
        issue_text: req.body.issue_text,
        created_by: req.body.created_by,
        assigned_to: req.body.assigned_to || '',
        status_text: req.body.status_text || '',
        open: true,
        created_on: new Date().toUTCString(),
        updated_on: new Date().toUTCString(),
        project:project
      })
      newIssue.save((error, savedIssue)=>{
        if(!error && savedIssue) {
          return res.json(savedIssue)
            
          
        }
      })
    })
    
   .put(function (req, res){
      let updateObj = {};
      Object.keys(req.body).forEach((key) => {
        if (req.body[key] != '') {
          updateObj[key] = req.body[key];
        }
      });
      if (!req.body._id) {
        return res.json({ error: 'missing _id' });
      }
        if (Object.keys(updateObj).length < 2) {
        return res.json({ error: 'no update field(s) sent', '_id': req.body._id });
      };
      console.log('updateObj: ' + updateObj.id)
      updateObj['updated_on'] = new Date().toUTCString();
      Issue.findByIdAndUpdate(req.body._id, updateObj, { new: true }, (error, updatedIssue) => {
        if (updatedIssue) {
          return res.json({ result: 'successfully updated', '_id': req.body._id });
        } else {
          return res.json({ error: 'could not update', '_id': req.body._id });
        }
      });
    })


    // .put(async (req, res)=>{
    //   let project = req.params.project;
    //   let fields = ['_id','issue_title', 'issue_text', 'created_by', 'assigned_to', 'status_text'];
    //   let fieldsToUpdate= queryOrBodyParser(req.body,fields);

    //   if(Object.keys(fieldsToUpdate).length<2){
    //       if(!req.body._id){
    //         return res.send({error:'missing _id'})
    //       }
    //       return res.send({error: 'no update field(s) sent', _id:fieldsToUpdate._id})
    //   }

    //   let issue=await Issue.findOne({_id:fieldsToUpdate._id}).exec();

    //   if(!issue){
    //     return res.send({error:'could not update', _id:fieldsToUpdate._id});
    //   }

    //   delete fieldsToUpdate._id;
    //   Object.keys(fieldsToUpdate).forEach(key=>{
    //    issue[key]=fieldsToUpdate[key];
    //    issue.markModified('key');
    //   })
    //   issue.updated_on=Date();

    //   issue.save(function (err){
    //     if(err) return handleError(err);
    //   });

    //   res.json({result: 'successfully updated', _id:issue._id})
    // })




    
    .delete(function (req, res){
      let project = req.params.project;
      if(!req.body._id){
        return res.json({ error: 'missing _id' })
      }
      Issue.findByIdAndRemove(req.body._id, (error,deletedIssue) => {
        if(!error && deletedIssue){
          res.json({result: 'successfully deleted', '_id':req.body._id })
        }else if(!deletedIssue){
          res.json({ error: 'could not delete', '_id': req.body._id })
        }
      })
      
    });
    
};
