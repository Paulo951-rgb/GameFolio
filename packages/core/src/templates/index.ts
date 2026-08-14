import type { ThemeConfig } from "@gamer-cv/types";

/**
 * Template registry entry — a template is presentation-only. Selection of
 * WHICH data is shown is owned upstream by the visibility engine; a template
 * only renders the normalized data it receives. This module keeps the
 * registry/selection logic in core (no React) so it is portable to Electron.
 */
export interface TemplateDefinition {
  readonly id: string;
  readonly name: string;
  readonly defaultTheme: ThemeConfig;
}

export class TemplateRegistry {
  private readonly templates = new Map<string, TemplateDefinition>();

  register(t: TemplateDefinition): this {
    if (this.templates.has(t.id)) {
      throw new Error(`Template "${t.id}" already registered`);
    }
    this.templates.set(t.id, t);
    return this;
  }

  get(id: string): TemplateDefinition | undefined {
    return this.templates.get(id);
  }

  list(): TemplateDefinition[] {
    return [...this.templates.values()];
  }

  has(id: string): boolean {
    return this.templates.has(id);
  }
}
