const fs = require('fs')
const axios = require("axios")
var HttpsProxyAgent = require('https-proxy-agent');

var posts = {}
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms))
const axget = async (url,config) => {
 try {
    const response = await axios.get(url,config)
    return response
 } catch (error) {
    if (error.code === 'ECONNRESET'){
        console.log("Connection Reset")
        return axget(url,config)
    }
 }
}
const fetchLatest = async () => {
    const latestData = await fs.readFileSync("./info.json")
    const oldDataFile = await  fs.readFileSync("./posts.json")
    const oldData = JSON.parse(oldData)
    const latest = JSON.parse(latestData)
    const proxy =  new HttpsProxyAgent.HttpsProxyAgent(`http://160.86.242.23:8080`)
    await wait(1000)
    console.log("Connection Emstablished")
    const latestPost = await axget('https://api.cbmc.club/v1/latest?limit=1',{
        httpsAgent: proxy
    })
    console.log("Fetched Latest Post")
    const json = latestPost.data
    const id = json.posts["1"].post.id.platform
    //
    for (let i = latest.totalPosts; i < id;i++){
        console.log("Fetching Post " + i)
        try {
            const post = await axget(`https://api.cbmc.club/v1/post/${i}`,{
                httpsAgent:  proxy
        
                 
            }) 
            const json = post.data
            posts[i] = json
            console.log(posts[i])
        } catch (error) {
            posts[i] = error.data
        }
    }
    fs.writeFileSync('posts.json', JSON.stringify(Object.assign(oldData,posts)))
    fs.writeFileSync('info.json', JSON.stringify({totalPosts: id}))
}
fetchLatest()
