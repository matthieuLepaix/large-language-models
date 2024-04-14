import { ChatOpenAI } from "@langchain/openai";
import { AgentExecutor, createOpenAIToolsAgent } from "langchain/agents";

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
  ["human", "{input}"],
  new MessagesPlaceholder("agent_scratchpad"),
]);

async function run() {
  const agent = await createOpenAIToolsAgent({
    llm: model,
    tools,
    prompt,
  });

  const agentExecutor = new AgentExecutor({
    agent,
    tools,
    verbose: true,
  });

  await agentExecutor.invoke({
    input:
      "What are the meeting rooms available in New York for 3 hours on 2024-05-25 at 1pm for 3 people?",
  });
}

run()
  .then(() => console.log("Done!"))
  .catch(console.error);
