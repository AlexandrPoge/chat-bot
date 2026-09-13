import path from "node:path";

const MAX_TEXT_LENGTH = 12_000;
const MIME_BY_EXTENSION: Record<string, string[]> = {
  pdf: ["application/pdf"],
  docx: ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  txt: ["text/plain"],
  md: ["text/markdown", "text/plain"],
};

function extensionFor(file: File) {
  return file.name.split(".").pop()?.toLowerCase() ?? "";
}

function compact(value: string) {
  return value.replace(/\s+/g, " ").trim().slice(0, MAX_TEXT_LENGTH);
}

async function validateFile(file: File, extension: string) {
  const allowed = MIME_BY_EXTENSION[extension];
  if (!allowed || (file.type && !allowed.includes(file.type))) return "Use a PDF, DOCX, TXT, or Markdown file.";
  const header = new Uint8Array(await file.slice(0, 512).arrayBuffer());
  if (extension === "pdf" && new TextDecoder().decode(header.slice(0, 5)) !== "%PDF-") return "This file is not a valid PDF.";
  if (extension === "docx" && !(header[0] === 0x50 && header[1] === 0x4b)) return "This file is not a valid DOCX.";
  if ((extension === "txt" || extension === "md") && header.includes(0)) return "Text sources must contain plain UTF-8 text.";
}

async function extractPdf(buffer: ArrayBuffer) {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const standardFontDataUrl = path.join(process.cwd(), "node_modules/pdfjs-dist/standard_fonts/");
  const document = await pdfjs.getDocument({ data: new Uint8Array(buffer), standardFontDataUrl }).promise;
  const pages: string[] = [];
  for (let pageNumber = 1; pageNumber <= Math.min(document.numPages, 60); pageNumber += 1) {
    const page = await document.getPage(pageNumber);
    const content = await page.getTextContent();
    pages.push(content.items.map((item) => "str" in item ? item.str : "").join(" "));
    if (pages.join(" ").length >= MAX_TEXT_LENGTH) break;
  }
  return pages.join(" ");
}

export async function extractTrustedText(file: File) {
  const extension = extensionFor(file);
  const validationError = await validateFile(file, extension);
  if (validationError) return { error: validationError };
  try {
    const buffer = await file.arrayBuffer();
    let text = "";
    if (extension === "pdf") text = await extractPdf(buffer);
    else if (extension === "docx") {
      const mammoth = await import("mammoth");
      text = (await mammoth.extractRawText({ arrayBuffer: buffer })).value;
    } else text = new TextDecoder("utf-8", { fatal: true }).decode(buffer);
    const clean = compact(text);
    return clean ? { text: clean } : { error: "No searchable text was found in this file." };
  } catch (error) {
    console.error("Server document extraction failed", error);
    return { error: "The file could not be read securely. Try another text-based source." };
  }
}
