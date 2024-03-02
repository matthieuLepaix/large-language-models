import "@tensorflow/tfjs-node";
import { prompt as readLine } from "readline-sync";
import {
  RunnableSequence,
  RunnablePassthrough,
  RunnableWithMessageHistory,
} from "@langchain/core/runnables";
import { Ollama } from "@langchain/community/llms/ollama";
import { formatDocumentsAsString } from "langchain/util/document";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { TensorFlowEmbeddings } from "@langchain/community/embeddings/tensorflow";

import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatMessageHistory } from "langchain/stores/message/in_memory";
import { MessagesPlaceholder } from "@langchain/core/prompts";

import { loadUrl, convertDocsToString } from "../utils";

const URLS = [
  "https://www.industriousoffice.com",
  "https://www.industriousoffice.com/about-us",
  "https://www.industriousoffice.com/enterprise",
  "https://www.industriousoffice.com/brokers",
  "https://www.industriousoffice.com/landlords",
  "https://www.industriousoffice.com/solutions",
  "https://www.industriousoffice.com/solutions/offices",
  "https://www.industriousoffice.com/solutions/access",
  "https://www.industriousoffice.com/solutions/virtual",
  "https://www.industriousoffice.com/solutions/conference-and-meeting-rooms",
  "https://www.industriousoffice.com/meeting-rooms?bounds=-74.2596399%2C40.477399%2C-73.700292%2C40.917577&center=-74.0059945%2C40.7127492&query=New%20York%20City&zoom=14",
];

const ollama = new Ollama({
  baseUrl: "http://localhost:11434",
  model: "industrious-assistant",
});

// Split the text into 500 character chunks. And overlap each chunk by 20 characters
const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 500,
  chunkOverlap: 20,
});

const TEMPLATE = `Using the below provided context and chat history, 
answer the user's question to the best of 
your ability 
using only the resources provided. Be verbose!

<context>
{context}
</context>`;

const REPHRASE_QUESTION_SYSTEM_TEMPLATE = `Given the following conversation and a follow up question, 
rephrase the follow up question to be a standalone question.`;

const rephraseQuestionChainPrompt = ChatPromptTemplate.fromMessages([
  ["system", REPHRASE_QUESTION_SYSTEM_TEMPLATE],
  new MessagesPlaceholder("history"),
  [
    "human",
    "Rephrase the following question as a standalone question:\n{question}",
  ],
]);

async function run() {
  const sessionId = "some-key";
  const history = new ChatMessageHistory();
  const prompt = ChatPromptTemplate.fromMessages([
    ["system", TEMPLATE],
    new MessagesPlaceholder("history"),
    [
      "human",
      "Now, answer this question using the previous context and chat history:\n{standalone_question}",
    ],
  ]);

  console.log("Loading website data...");
  const splitDocs: any = [];
  await Promise.all(
    URLS.map(async (url) => {
      const data = await loadUrl(url);
      splitDocs.push(...(await textSplitter.splitDocuments(data)));
    }),
  );

  // Then use the TensorFlow Embedding to store these chunks in the datastore
  const vectorStore = await MemoryVectorStore.fromDocuments(
    splitDocs,
    new TensorFlowEmbeddings(),
  );

  const retriever = vectorStore.asRetriever();

  const documentRetrievalChain = RunnableSequence.from([
    (input) => input.standalone_question,
    retriever,
    convertDocsToString,
  ]);

  const rephraseQuestionChain = RunnableSequence.from([
    rephraseQuestionChainPrompt,
    ollama,
    new StringOutputParser(),
  ]);

  const chain = RunnableSequence.from([
    RunnablePassthrough.assign({
      standalone_question: rephraseQuestionChain,
    }),
    RunnablePassthrough.assign({
      context: documentRetrievalChain,
    }),
    prompt,
    ollama,
    new StringOutputParser(),
  ]);

  const chainWithHistory = new RunnableWithMessageHistory({
    runnable: chain,
    getMessageHistory: (_sessionId) => history,
    historyMessagesKey: "history",
    inputMessagesKey: "question",
  });

  while (true) {
    const query = readLine({
      prompt: "Your question (`/bye` to end the chat): ",
    });

    if (query.trim() === "/bye") {
      console.log("Goodbye!");
      process.exit(0);
    }

    if (query.trim() === "") {
      console.log("Please enter an input.");
      process.exit(1);
    }

    const result = await chainWithHistory.invoke(
      { question: query },
      {
        configurable: {
          sessionId,
        },
      },
    );
    console.log(result);
  }
}

run()
  .then(() => {
    console.log("Done!");
  })
  .catch((e) => {
    console.error(e);
  });
