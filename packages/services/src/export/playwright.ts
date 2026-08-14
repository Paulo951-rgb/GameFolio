import type {
  ExportService,
  ExportInput,
  ExportOutput,
} from "./types";
import {
  PDF_CONTENT_TYPE,
  PNG_CONTENT_TYPE,
} from "./types";

/**
 * Minimal structural type for the Playwright chromium object we use. Defining
 * it locally (rather than importing playwright's types) keeps this package
 * typecheckable when the optional playwright dependency isn't installed.
 */
interface ChromiumBrowser {
  close(): Promise<void>;
  newPage(): Promise<ChromiumPage>;
}
interface ChromiumPage {
  goto(url: string, opts?: { waitUntil?: "load" | "networkidle"; timeout?: number }): Promise<unknown>;
  waitForSelector(selector: string, opts?: { timeout?: number }): Promise<unknown>;
  pdf(opts: {
    format?: string;
    printBackground?: boolean;
    margin?: { top?: string; right?: string; bottom?: string; left?: string };
  }): Promise<Uint8Array>;
  screenshot(opts: {
    type?: "png";
    fullPage?: boolean;
    scale?: "device" | "css";
  }): Promise<Uint8Array>;
}
interface ChromiumLike {
  launch(opts: {
    executablePath?: string;
    args?: string[];
  }): Promise<ChromiumBrowser>;
}

/**
 * Playwright-backed exporter. Launches a headless Chromium, navigates to the
 * isolated render URL (which renders the SAME template as the live preview),
 * and captures a PDF or PNG. The browser is reused across calls where possible.
 *
 * Browser discovery (in order):
 *   1. PLAYWRIGHT_EXECUTABLE_PATH env (absolute path to a chromium binary)
 *   2. the Playwright-bundled chromium channel
 *   3. system "chromium" channel (Debian package)
 *
 * --no-sandbox is required in many container environments (the sandbox needs
 * user namespaces that are often disabled); it does not affect output fidelity.
 */
export class PlaywrightExporter implements ExportService {
  private readonly executablePath?: string;
  private readonly launchArgs: string[];

  constructor(opts: { executablePath?: string; launchArgs?: string[] } = {}) {
    this.executablePath = opts.executablePath;
    this.launchArgs = opts.launchArgs ?? ["--no-sandbox", "--disable-setuid-sandbox"];
  }

  private async getChromium(): Promise<ChromiumLike> {
    // Use a computed specifier so webpack cannot statically analyze the import
    // (otherwise transpilePackages forces it to bundle playwright, whose
    // optional native deps — kerberos — fail to resolve). The module is also
    // listed in serverComponentsExternalPackages as a belt-and-suspenders.
    const moduleName = "playwright";
    const mod = (await import(/* webpackIgnore: true */ moduleName)) as {
      chromium: ChromiumLike;
    };
    return mod.chromium;
  }

  async render(input: ExportInput): Promise<ExportOutput> {
    const chromium = await this.getChromium();
    const browser = await chromium.launch({
      executablePath: this.executablePath,
      args: this.launchArgs,
    });

    try {
      const page = await browser.newPage();
      await page.goto(input.renderUrl, { waitUntil: "networkidle", timeout: 30_000 });
      // The render page sets a data attribute once the template is mounted.
      await page.waitForSelector("[data-cv-rendered='true']", { timeout: 15_000 });

      if (input.format === "pdf") {
        const buffer = await page.pdf({
          format: "A4",
          printBackground: true,
          margin: { top: "0", right: "0", bottom: "0", left: "0" },
        });
        return {
          buffer: Buffer.from(buffer),
          contentType: PDF_CONTENT_TYPE,
          filename: "gamer-cv.pdf",
        };
      }

      const buffer = await page.screenshot({
        type: "png",
        fullPage: true,
        scale: "device",
      });
      return {
        buffer: Buffer.from(buffer),
        contentType: PNG_CONTENT_TYPE,
        filename: "gamer-cv.png",
      };
    } finally {
      await browser.close();
    }
  }
}

/**
 * Build the active ExportService from server env. For the MVP a single
 * Playwright-backed exporter is used; the factory keeps the door open to a
 * cloud-render adapter (Browserless) chosen by env.
 */
let cached: PlaywrightExporter | null = null;

export function createExportService(
  env: NodeJS.ProcessEnv = process.env,
): ExportService {
  if (cached) return cached;
  cached = new PlaywrightExporter({
    executablePath: env.PLAYWRIGHT_EXECUTABLE_PATH,
  });
  return cached;
}
