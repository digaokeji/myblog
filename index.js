const path = require('path')
const express = require('express')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const flash = require('connect-flash')
const config = require('config-lite')(__dirname)
const routes = require('./routes')
const pkg = require('./package')

const app = express()

app.set('views',path.join(__dirname,'views'))
app.set('view engine','ejs')

app.use(express.static(path.join(__dirname,'public')))

app.use(session({
  name: config.session.key,
  secret:config.session.secret,
  resave:true,
  saveUninitialized: false,
  cookie:{
    maxAge:config.session.maxAge
  },
  store: new MongoStore({
    url:config.mongodb
  })
}))

app.use(flash())

app.use(require('express-formidable')({
  uploadDir: path.join(__dirname, 'public/img'), // 上传文件目录
  keepExtensions: true// 保留后缀
}))

app.locals.blog = {
  title: pkg.name,
  description: pkg.description
}

app.use(function(req,res,next){
  res.locals.user = req.session.user
  res.locals.success = req.flash('success').toString()
  res.locals.error = req.flash('error').toString()
  next()
})

// 路由
routes(app)


app.use(function (err,req,res,next){
  console.error(err)
  req.flash('error',err.message)
  res.redirect('/posts')
})

app.listen(config.port,function(){
  console.log(`${pkg.name} listening on port ${config.port}`)
})
