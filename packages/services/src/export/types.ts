/**
 * Export service (Phase 3) — pixel-perfect PDF/PNG via headless Chromium.
 *
 * Architecture doc §8: the export must be "ce qui est affiché dans l'aperçu
 * est exactement ce qui est exporté". We achieve this by rendering the SAME
 * template component into an isolated server page, then capturing it with a
 * headless browser — not html2canvas/jsPDF (which degrade fonts/shadows).
 *
 * The exporter is behind the `ExportService` interface so the domain never
 * couples to Playwright. A future Browserless / cloud-render adapter only
 * needs to implement this interface.
 */

export type ExportFormat = "pdf" | "png";

export interface ExportInput {
  /** Absolute URL of the isolated render page (with the profile already encoded). */
  renderUrl: string;
  format: ExportFormat;
}

export interface ExportOutput {
  /** Raw bytes of the PDF/PNG. */
  buffer: Buffer;
  contentType: string;
  filename: string;
}

export interface ExportService {
  render(input: ExportInput): Promise<ExportOutput>;
}

export const PDF_CONTENT_TYPE = "application/pdf";
export const PNG_CONTENT_TYPE = "image/png";
