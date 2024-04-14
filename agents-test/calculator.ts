import { ChatOpenAI } from "langchain/chat_models/openai";
import { AgentExecutor, createOpenAIToolsAgent } from "langchain/agents";

import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { addTool, exponentiateTool, multiplyTool } from "./tools";

const model = new ChatOpenAI({
  modelName: "gpt-3.5-turbo",
  temperature: 0,
  configuration: {
    organization: process.env.OPENAI_ORG,
  },
});

/** Define your list of tools. */
const tools = [addTool, multiplyTool, exponentiateTool];

const prompt = ChatPromptTemplate.fromMessages([
  ["system", "You are very powerful assistant, but don't know current events"],
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
      "Take 3 to the fifth power and multiply that by the sum of twelve and three, then square the whole result",
  });
}

run()
  .then(() => console.log(Math.pow(Math.pow(3, 5) * 15, 2)))
  .catch(console.error);
