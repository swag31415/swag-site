require('@tensorflow/tfjs')
const use = require('@tensorflow-models/universal-sentence-encoder')
const model = use.loadQnA()

const fs = require("fs")
const cache_file = "./src/assets/a_embed.json"

const advice = ["./src/assets/heyfromthefuture.json", "./src/assets/randomstuffifound.json"]
  .map(path => JSON.parse(fs.readFileSync(path)))
  .reduce((a, b) => {
    a.responses.push(...b.responses)
    a.contexts.push(...b.contexts)
    return a
  })

const advice_embeddings = new Promise((res) => fs.readFile(cache_file, (err, data) => {
  // If we had an error while reading (probably because it was missing)
  if (err) {
    console.log("helpful_api: advice embeddings not found. generating now. this will take a long time")
    model.then(m =>
      // Embed the advice as responses and contexts. Get the embeddings. Convert the tensor to js array.
      m.embed({ queries: [], responses: advice.responses, contexts: advice.contexts })["responseEmbedding"].arraySync()
    ).then(a_embed => {
      // Cache the embeddings as json
      fs.writeFile(cache_file, JSON.stringify(a_embed), () => console.log("embeddings cached successfully"))
      // Return the embeddings
      res(a_embed)
    })
  } else {
    // Return the embeddings
    res(JSON.parse(data))
  }
}))

const zipWith = (f, xs, ys) => {
  const ny = ys.length
  return (xs.length <= ny ? xs : xs.slice(0, ny)).map((x, i) => f(x, ys[i]))
}

const dotProduct = (xs, ys) => {
  const sum = xs => xs ? xs.reduce((a, b) => a + b, 0) : undefined
  return xs.length === ys.length ? sum(zipWith((a, b) => a * b, xs, ys)) : undefined
}

module.exports.get_advice = async (question) => {
  // Get the model
  const m = await model
  // Get the advice embeddings
  const a_embed = await advice_embeddings
  // Embed the question. Get the embeddings. Convert tensor to js array.
  // Get the first element because there's only one question.
  const q_embed = m.embed({ queries: [question], responses: [] })['queryEmbedding'].arraySync()[0]
  // Now that we have the embeddings we do the dot product!
  let relavance = {}
  for (let i = 0; i < advice.responses.length; i++) {
    // For each advice compute relevance via the dot product
    relavance[advice.responses[i]] = dotProduct(q_embed, a_embed[i])
  }
  return relavance
}

const { Pool } = require('pg')
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

// CREATE TABLE helpful_data (
//   question text NOT NULL,
//   n_asks int NOT NULL,
//   ask_time timestamp NULL DEFAULT CURRENT_TIMESTAMP
// );
module.exports.log = (question) => {
  pool.connect().then(client => {
    return client
      .query("INSERT INTO helpful_data (question, n_asks) VALUES ($1, $2)", [question, 1])
      .then(res => client.release())
      .catch(err => {
        client.release()
        console.log(err.stack)
      })
  })
}

module.exports.update = (question) => {
  pool.connect().then(client => {
    return client
      .query("UPDATE helpful_data SET n_asks=n_asks+1 WHERE id=(SELECT id FROM helpful_data WHERE question=$1 ORDER BY ask_time DESC LIMIT 1)", [question])
      .then(res => client.release())
      .catch(err => {
        client.release()
        console.log(err.stack)
      })
  })
}