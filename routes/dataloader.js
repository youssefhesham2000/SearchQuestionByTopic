var dbConnect =   require('../DB/dbConnect');
var express = require('express');
var router = express.Router();

const fs = require('fs'); 
const csv = require('csv-parser');
const topic = dbConnect.Topic
const question = dbConnect.Question
const TOPIC_LEVEL_ONE = 'Topic Level 1'
const TOPIC_LEVEL_TWO = 'Topic Level 2'
const TOPIC_LEVEL_THREE = 'Topic Level 3'

const annotations = ['Annotation 1', 'Annotation 2', 'Annotation 3', 'Annotation 4', 'Annotation 5']
const QUESTION_NUMBER = 'Question number'

router.get('/', async function(req, res, next) {
    // load the topics data
    let success = true
    const topicToAncestorsMap = new Map();
    const topicsFilePath = './resources/QuestionsandTopics-Topics.csv'
    await fs.createReadStream(topicsFilePath)
    .pipe(csv())
    .on('data', function(data){
        try {
            var ancestorSet = topicToAncestorsMap.get(data[TOPIC_LEVEL_ONE]);
            if( ancestorSet === undefined){
                ancestorSet = new Set();
            }
            if(data[TOPIC_LEVEL_TWO] != ''){
                ancestorSet.add(data[TOPIC_LEVEL_TWO])
            }
            if( data[TOPIC_LEVEL_THREE] != ''){
                ancestorSet.add(data[TOPIC_LEVEL_THREE])
            }
            topicToAncestorsMap.set(data[TOPIC_LEVEL_ONE], ancestorSet)
            ancestorSet = topicToAncestorsMap.get(data[TOPIC_LEVEL_TWO]);
            if( ancestorSet === undefined){
                ancestorSet = new Set();
            }
            if(data[TOPIC_LEVEL_THREE] != ''){
                ancestorSet.add(data[TOPIC_LEVEL_THREE])
            }
            topicToAncestorsMap.set(data[TOPIC_LEVEL_TWO], ancestorSet)
            topicToAncestorsMap.set(data[TOPIC_LEVEL_THREE], null)
        }
        catch(err) {
            //error handler
            success = false
        }
    }).on('end',async function() {
        // delete already existing topics if any
        await topic.deleteMany({})
        const topicList = []
        topicToAncestorsMap.forEach((value, key) =>{
            let ancestors = [];
            if(value != null){
                ancestors = Array.from(value)
            }
            topicList.push(new dbConnect.Topic({topic: key, ancestors: ancestors}))
        })
        await topic.insertMany(topicList)
        const topics = await topic.find({})
        console.log(topics);
      });

      const questionsFilePath = './resources/QuestionsandTopics-Questions.csv'
      const questionList = []
      await fs.createReadStream(questionsFilePath)
      .pipe(csv())
      .on('data', function(data){
          try {
            const questionTopicList = []
            annotations.forEach((annotation) => {
                if(data[annotation] != ''){
                    questionTopicList.push(data[annotation])
                }
            })
            questionList.push(new question({questionNum: data[QUESTION_NUMBER], topics:questionTopicList }))
          }
          catch(err) {
              //error handler
              success = false 
          }
      }).on('end',async function() {
          // delete already existing questions if any
          await question.deleteMany({})
          await question.insertMany(questionList)
          const questions = await question.find({questionNum: 106})
          console.log(questions);
        });
        if(success)
            res.send("success")
        else
            res.send("failed")
})
module.exports = router;