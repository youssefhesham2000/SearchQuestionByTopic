var dbConnect =   require('../DB/dbConnect');
var express = require('express');
var router = express.Router();


const topic = dbConnect.Topic
const question = dbConnect.Question

router.get('/', async function(req, res, next) {
  const topicName = req.query.q
  let relatedTopics =[]
  const topicsTest = await topic.find({topic:topicName},{ancestors:1, topic:1, _id:0})
  topicsTest.forEach((topicItem)=>{
    relatedTopics.push(topicItem.topic)
    relatedTopics = relatedTopics.concat(topicItem.ancestors)
  });
  const matchedQuestionNumbers = []
  const questionNumbers = await question.find({topics:{"$in":relatedTopics}}, {questionNum:1, _id:0})
  questionNumbers.forEach((questionNumber)=>{
    matchedQuestionNumbers.push(questionNumber.questionNum);
  })
  res.send(matchedQuestionNumbers)
});

module.exports = router;