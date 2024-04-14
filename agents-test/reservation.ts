import { prompt as readLine } from "readline-sync";

import { ChatOpenAI } from "@langchain/openai";
import { AgentExecutor, createOpenAIToolsAgent } from "langchain/agents";
import { HumanMessage, AIMessage } from "@langchain/core/messages";

import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { meetingRoomsAvailabilityTool } from "./tools";

const model = new ChatOpenAI({
  modelName: "gpt-3.5-turbo",
  temperature: 0,
  configuration: {
    organization: process.env.OPENAI_ORG,
  },
});

/** Define your list of tools. */
const tools = [meetingRoomsAvailabilityTool];

const prompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    "You are very powerful assistant that helps people book a meeting room, but don't know current events",
  ],
  new MessagesPlaceholder("history"),
  ["human", "{input}"],
  new MessagesPlaceholder("agent_scratchpad"),
]);

async function run() {
  const history: Array<HumanMessage | AIMessage> = [];
  const agent = await createOpenAIToolsAgent({
    llm: model,
    tools,
    prompt,
  });

  const agentExecutor = new AgentExecutor({
    agent,
    tools,
    verbose: process.env.VERBOSE === "true",
  });

  while (true) {
    // Test query: What are the meeting rooms available in New York for 3 hours on 2024-05-25 at 1pm for 3 people?
    const query = readLine({
      prompt: "> ",
    });

    if (query.trim() === "/bye") {
      console.log("Goodbye!");
      process.exit(0);
    }

    if (query.trim() === "") {
      console.log("Please enter an input.");
      continue;
    }

    const result = await agentExecutor.invoke({
      input: query,
      history,
    });

    history.push(new HumanMessage(query));
    history.push(new HumanMessage(result.output));

    console.log(result.output);
  }
}

run()
  .then(() => console.log("Done!"))
  .catch(console.error);
