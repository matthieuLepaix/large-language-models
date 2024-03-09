import * as path from "path";
import * as fs from "fs";
import { Ollama } from "@langchain/community/llms/ollama";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";

type Lang = "fr"; // | "es" | "nl";
const LANGUAGES: {
  [key in Lang]: string;
} = {
  fr: "French",
  //   es: "Spanish",
  //   nl: "Dutch",
};

export const model = new Ollama({
  baseUrl: "http://localhost:11434",
});

const dataToTranslate: Record<string, any> = JSON.parse(
  fs.readFileSync(path.join(__dirname, "./locales/test.json")).toString(),
);

const SYSTEM_TEMPLATE = `
You are a translator specialiozed in Coworking spaces industry.
Industrious Office is a company.
You translate the input of the user in the language requested. 
You don't add anything to it, no other word. You just translate it.
`;

async function run() {
  const prompt = ChatPromptTemplate.fromMessages([
    ["system", SYSTEM_TEMPLATE],
    ["user", "{input}"],
  ]);

  const chain = RunnableSequence.from([
    prompt,
    model,
    new StringOutputParser(),
  ]);

  async function translate(params: { value: Record<string, any>; lang: Lang }) {
    const { value, lang } = params;
    const result: Record<string, any> = {};

    for (const key of Object.keys(value)) {
      if (typeof value[key] === "string") {
        console.log(`Translating: ${value[key]}`);

        result[key] = await chain.invoke({
          input: `Translate the following text in ${LANGUAGES[lang]}: ${value[key]}`,
        });

        console.log(`> ${result[key]}`);
      } else if (typeof value[key] === "object") {
        result[key] = await translate({
          value: value[key],
          lang,
        });
      } else {
        result[key] = value[key];
      }
    }

    return result;
  }

  for (const lang of Object.keys(LANGUAGES) as Lang[]) {
    console.log(`Translating to ${LANGUAGES[lang]}...`);

    const result = await translate({
      value: dataToTranslate,
      lang,
    });

    console.log(result);
    console.log("Writing to file...");
    fs.writeFileSync(
      path.join(__dirname, `./locales/${lang}.json`),
      JSON.stringify(result),
    );
  }
}

run()
  .then(() => console.log("done"))
  .catch(console.error);
