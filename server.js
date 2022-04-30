const express = require('express')
const cors = require('cors')
const wordcut = require('wordcut')

const app = express()

app.use(cors())
app.use(express.json())

wordcut.init()

app.use('/', express.static('client'))

app.post('/wordcut', (req, res) => {
    if(req.body && req.body.text){
        const words = wordcut.cutIntoArray(req.body.text)
        return res.json({ words })
    }
    return res.send('Invalid request')
})

app.listen(6969)

// goto http://localhost:6969/index.html