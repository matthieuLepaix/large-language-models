import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";

export function loadPDFFromDirectory(path: string) {
  const loader = new DirectoryLoader("data/industrious", {
    ".pdf": (path) => new PDFLoader(path),
  });

  return loader.load();
}
