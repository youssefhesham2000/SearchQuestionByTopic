var mongoose = require('mongoose');

const dbUrl = 'mongodb+srv://aklyoussef27:<pass>@cluster0.ct5c3z9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
mongoose.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error));

// Create a topic schema
const Schema = mongoose.Schema;
const TopicSchema = new Schema({
  topic: String,
  ancestors:[String]
});
TopicSchema.index({topic:1})

// Create a question schema
const QuestionSchema = new Schema({
    questionNum: Number,
    topics:[String]
  });

QuestionSchema.index({topics:1})
const Question = mongoose.model('QuestionSchema', QuestionSchema)
Question.createCollection()
const Topic = mongoose.model('TopicSchema', TopicSchema);
Topic.createCollection()

exports.Topic = Topic 
exports.Question = Question
