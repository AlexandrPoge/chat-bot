export async function extractFileSummary(file: File): Promise<string> {
  const extension = file.name.split(".").pop()?.toLowerCase();

  if (extension === "txt" || extension === "md") {
    return compact(await file.text());
  }

  if (extension === "docx") {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
    return compact(result.value);
  }

  if (extension !== "pdf") {
    return "This file type is stored, but it cannot be searched yet. Use PDF, DOCX, TXT, or Markdown for grounded answers.";
  }

  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
  const data = new Uint8Array(await file.arrayBuffer());
  const document = await pdfjs.getDocument({ data }).promise;
  const pages: string[] = [];

  for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
    const page = await document.getPage(pageNumber);
    const content = await page.getTextContent();
    pages.push(content.items.map((item) => "str" in item ? item.str : "").join(" "));
  }

  return compact(pages.join(" "));
}

function compact(value: string) {
  const text = value.replace(/\s+/g, " ").trim();
  if (!text) return "No selectable text was found in this file. Upload a text-based PDF, DOCX, TXT, or Markdown document.";
  return text.length > 12000 ? `${text.slice(0, 11997)}...` : text;
}
