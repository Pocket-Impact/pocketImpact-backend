import Sentiment from 'sentiment';
const sentiment = new Sentiment();

const result = sentiment.analyze("The sound quality is amazing, and the battery life lasts all day. However, the left earbud sometimes disconnects, which is super annoying. Still, I love using them every day!");
console.log(result); // { score: ..., comparative: ..., positive: [...], negative: [...] }
