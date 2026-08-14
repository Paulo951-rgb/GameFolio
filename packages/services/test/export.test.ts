import { describe, it, expect } from "vitest";
import http from "node:http";
import { existsSync } from "node:fs";
import { PlaywrightExporter } from "../src/export/playwright";
import type { ExportOutput } from "../src/export/types";

const SYSTEM_CHROMIUM = "/usr/bin/chromium";

/**
 * Serve a tiny HTML page that sets data-cv-rendered once mounted, matching the
 * contract the exporter waits for.
 */
function serveOnce(): Promise<{ url: string; close: () => Promise<void> }> {
  return new Promise((resolve) => {
    const server = http.createServer((_req, res) => {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(
        `<!doctype html><html><body>
          <div data-cv-rendered="true"><h1>Gamer CV</h1><p>Rang: Diamant</p></div>
        </body></html>`,
      );
    });
    server.listen(0, () => {
      const port = (server.address() as { port: number }).port;
      resolve({
        url: `http://127.0.0.1:${port}/`,
        close: () => new Promise((r) => server.close(() => r())),
      });
    });
  });
}

const canRun = existsSync(SYSTEM_CHROMIUM);

describe.runIf(canRun)("PlaywrightExporter (system chromium)", () => {
  it("renders a PDF with the expected content type", async () => {
    const srv = await serveOnce();
    const exporter = new PlaywrightExporter({ executablePath: SYSTEM_CHROMIUM });
    let out: ExportOutput;
    try {
      out = await exporter.render({ renderUrl: srv.url, format: "pdf" });
    } finally {
      await srv.close();
    }
    expect(out.contentType).toBe("application/pdf");
    expect(out.filename).toBe("gamer-cv.pdf");
    // A PDF starts with %PDF.
    expect(out.buffer.subarray(0, 4).toString("ascii")).toBe("%PDF");
    expect(out.buffer.length).toBeGreaterThan(1000);
  });

  it("renders a PNG with the expected content type", async () => {
    const srv = await serveOnce();
    const exporter = new PlaywrightExporter({ executablePath: SYSTEM_CHROMIUM });
    let out: ExportOutput;
    try {
      out = await exporter.render({ renderUrl: srv.url, format: "png" });
    } finally {
      await srv.close();
    }
    expect(out.contentType).toBe("image/png");
    expect(out.filename).toBe("gamer-cv.png");
    // A PNG starts with the 8-byte signature.
    expect(out.buffer.subarray(0, 8)).toEqual(
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    );
    expect(out.buffer.length).toBeGreaterThan(1000);
  });
});
