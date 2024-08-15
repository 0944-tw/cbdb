import { parse, stringify } from "https://deno.land/std@0.207.0/yaml/mod.ts";
import { Markdown,link } from "https://deno.land/x/deno_markdown/mod.ts";
import {resolve} from "https://deno.land/std/path/mod.ts";

 (async() => {
  console.log("CBMC Fetcher")
    const latestPost = (await fetch('https://api.cbmc.club/v1/latest?limit=1'))
    const json = await latestPost.json()
    const id = json.posts["1"].post.id.platform
    //
    for (let i = 0; i < id;i++){
        console.log("Fetching Post " + i)
        const post = await fetch(`https://api.cbmc.club/v1/post/${i}`)
        const json = await post.json()
        posts[i] = json
        console.log(posts[i])
    }
   Deno.writeTextFile("latest.json",JSON.stringify(posts))
})()
