const fs = require("fs");
const { type } = require("os");
const CBMC = {};
CBMC.api = "tw3.shdtw.cloud:20016";
CBMC.fetchLatest = async (limit) => {
  const latest = await fetch(`http://${CBMC.api}/v1/latest?limit=` + limit);
  return await latest.json();
};
CBMC.fetchPost = async (id) => {
  const post = await fetch(`http://${CBMC.api}/v1/post/` + id);
  return await post.json();
};
CBMC.getStatus = async (id) => {
  const status = await fetch(`http://${CBMC.api}/v1/find/` + id);
  return await status.json();
};
CBMC.getPostsCount = async () => {
  return await (
    await CBMC.fetchLatest(1)
  ).posts["1"].post.id.platform;
};
// CBMC-API

const UpdateCBDB = async () => {
  var info = await fs.readFileSync("./info.json");
  info = JSON.parse(info);
  //
  var errors = [];
  const latestPostsID = await CBMC.getPostsCount();
  if (info.totalPosts < latestPostsID) {
    console.log(
      `Out of Sync! Syncing... ${info.totalPosts} / ${latestPostsID}`
    );
    console.log(`Syncing ${latestPostsID - info.totalPosts} posts`);
  }
  for (let i = info.totalPosts; i < latestPostsID; i++) {
    const post = await CBMC.fetchPost(i);
    console.log(`獲取文章成功 ${i} / ${latestPostsID}`);
    CBMC[i] = post;
  }
  console.log("Writing to file...");
  for (let pid = 0; pid < latestPostsID; pid++) {
    if (CBMC[pid]) {
      fs.writeFileSync("./posts/" + pid + ".json", JSON.stringify(CBMC[pid]));
    }
  }
  console.log("Done!");
  if (errors.length > 0) {
    console.log(`CBDBSync 運行時出現了 ${errors.length} 個錯誤`);
  }
  console.log(`已經成功更新了 ${latestPostsID} 篇文章`);
};
(async () => {
  await UpdateCBDB();
  fs.writeFileSync(
    "info.json",
    JSON.stringify({ totalPosts: await CBMC.getPostsCount() })
  );
})();
