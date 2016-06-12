var express = require('express')
var app = express()

app.use(express.static('static'))

app.listen(5000, () => console.log('running on port 5000'))
