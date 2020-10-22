require('dotenv').config()

const express = require('express')
const { graphqlHTTP } = require('express-graphql')
const { GraphQLSchema, GraphQLObjectType } = require('graphql')
const mongoose = require('mongoose')
const cors = require('cors')
const app = express()

mongoose.connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
const db = mongoose.connection
db.on('error', err => console.log(err))
db.on('open', err => console.log('Connected to Mongoose'))

const querySchema = require('./graphql/query/root')
const mutationSchema = require('./graphql/mutation/root')
const isAuth = require('./middleware/is-auth')//authentication access token

const schema = new GraphQLSchema({
    query: querySchema,
    mutation: mutationSchema
})


var whitelist = ['http://localhost:3000','http://localhost:6000']
var corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}

app.use(cors(corsOptions))
if(process.env.NODE_ENV !== 'production') app.use(isAuth)

app.use('/graphql', graphqlHTTP((req) => {
  return {
        schema: schema,
        graphiql: process.env.NODE_ENV === 'development',//graphiql will show if on development
        context: { auth: process.env.NODE_ENV !== 'production' ? req.isAuth : true }
    }
}))

const PORT = process.env.PORT || 5000 //for Development, and env.PORT for production 
app.listen(PORT, () => console.log(`Server Running on PORT ${PORT}`))