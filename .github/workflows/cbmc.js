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
    console.log("Something Went Wrong While Creating HTTP Request")
    console.log(error)
    if (error.code === 'ECONNRESET'){
        console.log("Connection Reset")
        return axget(url,config)
    }
 }
}
const api = "tw3.shdtw.cloud:20016"
const fetchLatest = async () => {
    console.log("Starting Fetching Post")
    const latestData = await fs.readFileSync("./info.json")
    const oldDataFile = await  fs.readFileSync("./posts.json")
    const oldData = JSON.parse(oldDataFile)
    const latest = JSON.parse(latestData)
    // const proxy =  new HttpsProxyAgent.HttpsProxyAgent(`http://60.199.29.41:8111`)
    await wait(1000)
    console.log("Connection Emstablished")
    const latestPost = await axget(`http://${api}/v1/latest?limit=1`,{
      //  httpsAgent: proxy
    })
    console.log("Fetched Latest Post")
    console.log(latestPost)
    const json = latestPost.data
    const id = json.posts["1"].post.id.platform
    //
    for (let i = latest.totalPosts; i < id;i++){
        console.log("Fetching Post " + i)
        try {
            const post = await axget(`http://${api}/v1/post/${i}`,{
            }) 
            const json = post.data
            posts[i] = json
            console.log(posts[i])
        } catch (error) {
            posts[i] = error.data
        }
    }
    const LatestPost = await axget(`http://${api}/v1/latest?limit=300`,{
             //   httpsAgent:  proxy
           
            })            
    fs.writeFileSync('latestPost.json',JSON.stringify(LatestPost.data))
    fs.writeFileSync('posts.json', JSON.stringify(Object.assign(oldData,posts)))
    fs.writeFileSync('info.json', JSON.stringify({totalPosts: id}))
}
fetchLatest()
