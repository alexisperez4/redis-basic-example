const express = require('express')
const axios = require('axios')
const cors = require('cors')
const Redis = require('redis')

const redisClient = Redis.createClient()

const DEFAULT_EXPIRATION = 3600;

const app = express()
const port = 5000
app.use(cors())
app.get('/photos', async (req, res) => {

    const albumId = req.query.albumId
    redisClient.get(`photos?albumId=${albumId}`, async (error, photos) =>{
        if(error) console.error(error);
        if(photos){
            return res.json(JSON.parse(photos))
        }else{
            const { data } = await axios.get(
                "http://jsonplaceholder.typicode.com/photos",
                { params: { albumId } }
            )
            redisClient.SETEX(
                `photos?albumId=${albumId}`,
                DEFAULT_EXPIRATION, 
                JSON.stringify(data)
            )
            res.json(data)
        }
    })

})

app.get('/photos/:id', async (req, res) => {
    
    const { data } = await axios.get(
        `http://jsonplaceholder.typicode.com/photos/${req.params.id}`
    )
    res.json(data)
})


app.listen(port, () => {
    console.log(`Server listen on port ${port}`)
})