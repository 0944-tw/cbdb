const fs = require('fs')
const axios = require("axios")
var HttpsProxyAgent = require('https-proxy-agent');
const { algoliasearch } = require('algoliasearch');

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
const api = "tw3.shdtw.cloud:20016"

const fetchLatest = async () => {
    const latestData = await fs.readFileSync("./info.json")
    const oldDataFile = await  fs.readFileSync("./posts.json")
    const oldData = JSON.parse(oldDataFile)
    const latest = JSON.parse(latestData)
   //  const proxy =  new HttpsProxyAgent.HttpsProxyAgent(`http://160.86.242.23:8080`)
    await wait(1000)
    console.log("Connection Emstablished")
    const latestPost = await axget(`http://${api}/v1/latest?limit=1`,{
      //  httpsAgent: proxy
    })
    console.log("Fetched Latest Post")
     const json = latestPost.data
    const id = json.posts["1"].post.id.platform
    //
    for (let i = latest.totalPosts; i < id;i++){
        console.log("Fetching Post " + i)
        try {
            const post = await axget(`http://${api}/v1/post/${i}`,{
                //httpsAgent:  proxy
        
                 
            }) 
            const json = post.data
            posts[i] = json
            console.log(posts[i])
        } catch (error) {
            posts[i] = error.data
        }
    }
    const LatestPost = await axget(`http://${api}/v1/latest?limit=300`,{
              //  httpsAgent:  proxy
           
            })            
    fs.writeFileSync('latestPost.json',JSON.stringify(LatestPost.data))
    fs.writeFileSync('posts.json', JSON.stringify(Object.assign(oldData,posts)))
    fs.writeFileSync('info.json', JSON.stringify({totalPosts: id}))
    return Object.assign(oldData,posts)
}
const updateAlgolia = (data) =>{
    const client = algoliasearch('76O5YAWFNC', 'ec74ea084859bbb8c72367e4d9a67464');
    const formatted = []
    console.log(data)
    for (const [key, value] of Object.entries(data)) {
         console.log(value)
        if(value.status == "success") {
            const post = value.posts["1"].post
            formatted.push({
                content: post.content,
                type: post.type,
                id: post.id.platform
            })
        };
         
    }
     const chunked = []
    // split every 10kb
    while (formatted.length > 0) {
        chunked.push(formatted.splice(0, 25))
    }
 
    // upload to algolia
     chunked.forEach(async (chunk) => {
        await client.saveObjects({
            indexName: 'Posts',
            objects: chunk
        })
    })
    console.log(`
        Result: ${chunked.length * 35} posts uploaded to Algolia
        Uploaded at: ${new Date().toISOString()}
        Saved ${chunked.length} times
     `)

 }
(async () => {
    const data = await fetchLatest()
    updateAlgolia(data)
})()