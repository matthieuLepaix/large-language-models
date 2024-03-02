import { Ollama } from "@langchain/community/llms/ollama";
import { prompt } from "readline-sync";

const ollama = new Ollama({
  baseUrl: "http://localhost:11434", // Default value
  model: "llama2", // Default value
});

async function run() {
  const input = prompt({ prompt: "Enter a sentence to translate:" });
  const lang = prompt({ prompt: "Enter the language to translate to:" });

  if (!input || !lang) {
    console.log("Please enter a sentence and a language to translate to.");
    return;
  }
  const stream = await ollama.stream(`Translate "${input}" into ${lang}.`);

  const chunks: any = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }

  console.log(chunks.join(""));
}

run()
  .then(() => console.log("Done!"))
  .catch(console.error);
