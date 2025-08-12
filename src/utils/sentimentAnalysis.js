import Sentiment from 'sentiment';
const sentiment = new Sentiment();

export const analyzeAnswerSentiment=(answerText)=> {
  const result = sentiment.analyze(answerText);
  // result.score >0 means positive, <0 negative, 0 neutral
  let sentimentLabel = 'neutral';
  if (result.score > 0) sentimentLabel = 'positive';
  else if (result.score < 0) sentimentLabel = 'negative';
  return {
    score: result.score,
    sentiment: sentimentLabel,
  };
}
