import axios from "axios";
import Twit from "twit";

const twitterConsumerKey = "hSLQ5LMoTGl3BcMFSEZcwuv2R";
const twitterConsumerSecret = "HnmBqIlbuV37Aegkhv0Cy9OtyN02ZgJeQB4yREOq7lHT3Y1l3A";
const twitterAccessToken = "1686798377336401926-JoalIfzx9RSPp9wXzgyrOzL1M6DlXI";
const twitterAccessTokenSecret = "cAdtqx7Y9MADGwwJuhktPdH3Tfam4uQP6AanOa8B1KpjY";
const openaiApiKey = "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";

function getKeyword() {
  // select random keywords
  const keywords = [
    "reactjs",
    "javascript",
    "front-end developer",
    "javascript developer",
    "html",
    "css",
    "developer job",
    "tips for javascript developer",
    "website",
    "web design",
    "developer job",
    "MAANG companies",
    "coding",
    "reading book",
    "programmer work culture",
  ];

  const index = Math.floor(Math.random() * keywords.length);
  return keywords[index];
}

const api = new Twit({
  consumer_key: twitterConsumerKey,
  consumer_secret: twitterConsumerSecret,
  access_token: twitterAccessToken,
  access_token_secret: twitterAccessTokenSecret,
});

async function searchAndComment() {
  console.log("Searching for tweets...");

  const query = `${getKeyword()}`; // you can also use the "OR" / "AND" between keywords: eg -> javascript OR html"
  const maxTweets = 100;

  const { data: searchResults } = await api.get("search/tweets", {
    q: query,
    count: maxTweets,
  });
  
  console.log(
    `Found ${searchResults.statuses.length} tweets. Generating comments...`
  );

  for (const tweet of searchResults.statuses) {
    const { data: response } = await axios.post(
      "https://api.openai.com/v1/completions",
      {
        model: "text-davinci-003",
        prompt: `Comment on this tweet: "${tweet.text}", the reply to this tweet must be like i am writing it and also include some emoji that matches the generated text`,
        max_tokens: 70,
        temperature: 0.5,
        top_p: 1,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openaiApiKey}`,
        },
      }
    );

    const comment = response.choices[0].text;
    console.log(comment);

    const { data: postResponse } = await api.post("statuses/update", {
      status: `@${tweet.user.screen_name} ${comment}`,
      in_reply_to_status_id: tweet.id_str,
    });
    console.log(`Comment posted: ${postResponse.text}`);

    // Delay each iteration for 30min
    await new Promise((resolve) => setTimeout(resolve, 30 * 60 * 1000));
  }
  searchAndComment();
}

searchAndComment();
