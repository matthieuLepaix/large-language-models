import { Document } from "@langchain/core/documents";

export function convertDocsToString(documents: Document[]): string {
  return documents
    .map((document) => `<doc>\n${document.pageContent}\n</doc>`)
    .join("\n");
}
