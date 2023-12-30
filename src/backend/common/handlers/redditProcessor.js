"use strict";

const logger = require("../../logwrapper");
const axios = require("axios");

function postPicker(posts) {
    while (posts.length) {
        const randomNum = Math.floor(Math.random() * posts.length);
        const item = posts[randomNum]['data'];

        // Tests
        const over18 = item['over_18'];
        const image = item['preview']['images'][0]['source']['url'];
        const ups = item['ups'];
        const downs = item['downs'];
        if (over18 !== true && image != null && ups > downs) {
            return image;
        }

        // Failed Tests, remove from array.
        posts.splice(randomNum, 1);
    }

    return false;
}

async function getSubredditData(subName) {
    const normalizedSubName = subName.replace("/r/", '').replace("r/", '');
    const url = `https://www.reddit.com/r/${normalizedSubName}/hot.json?count=15&raw_json=1`;

    return await axios.get(url)
        .then(function(response) {
            return response.data.data.children;
        })
        .catch(function(err) {
            logger.warn(`Error getting subreddit ${subName}`, err);
        });
}

// Pulls a random image from a subreddit.
async function randomImageFromSubReddit(subreddit) {
    const subData = await getSubredditData(subreddit);

    if (subData == null) {
        logger.error("Couldn't find any valid posts in the subreddit.");
        renderWindow.webContents.send(
            "error",
            "subredditには有効な投稿が見つかりません"
        );
        return "";
    }

    // Get our random post image url.
    const imageUrl = postPicker(subData);
    if (imageUrl === false) {
        logger.error("Couldn't find any valid posts in the subreddit.");
        renderWindow.webContents.send(
            "error",
            "subredditには有効な投稿が見つかりません"
        );
        return "";
    }

    return imageUrl;
}

// Export Functions
exports.getRandomImage = randomImageFromSubReddit;
