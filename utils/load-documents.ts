import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { JSONLoader } from "langchain/document_loaders/fs/json";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";

export function loadPDFFromDirectory(path: string) {
  const loader = new DirectoryLoader("data/industrious", {
    ".pdf": (path) => new PDFLoader(path),
  });

  return loader.load();
}

export function loadJSONFromDirectory(path: string) {
  const loader = new DirectoryLoader(path, {
    ".json": (path) => new JSONLoader(path),
  });

  return loader.load();
}
