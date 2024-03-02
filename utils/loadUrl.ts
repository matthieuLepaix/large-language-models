import { CheerioWebBaseLoader } from "langchain/document_loaders/web/cheerio";

export function loadUrl(url: string) {
  const loader = new CheerioWebBaseLoader(url);

  return loader.load();
}
