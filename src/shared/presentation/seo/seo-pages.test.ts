import { describe, expect, it } from 'vitest';

import { TOOL_IDS } from '@/shared/domain/tools';
import { getTool } from '@/shared/presentation/tools/tool-registry';

import { SEO_PAGES } from './seo-pages';

const DASHES = /[–—]/;

describe('SEO pages', () => {
  it('covers the home, the catalog and every tool exactly once', () => {
    const paths = SEO_PAGES.map((page) => page.path);
    expect(new Set(paths).size).toBe(paths.length);
    expect(paths).toContain('/');
    expect(paths).toContain('/tools');
    for (const id of TOOL_IDS) expect(paths).toContain(`/tools/${id}`);
  });

  it('has unique titles, descriptions and headings', () => {
    for (const field of ['title', 'description', 'heading'] as const) {
      const values = SEO_PAGES.map((page) => page[field]);
      expect(new Set(values).size, field).toBe(values.length);
    }
  });

  it.each(SEO_PAGES.map((page) => [page.path, page]))(
    '%s keeps titles and descriptions in snippet range, without dashes',
    (_path, page) => {
      expect(page.title.length).toBeGreaterThanOrEqual(30);
      expect(page.title.length).toBeLessThanOrEqual(65);
      expect(page.description.length).toBeGreaterThanOrEqual(110);
      expect(page.description.length).toBeLessThanOrEqual(165);
      for (const text of [
        page.title,
        page.description,
        page.heading,
        page.intro,
      ]) {
        expect(text).not.toMatch(DASHES);
      }
    }
  );

  it('gives every tool a guide (how to use and limits)', () => {
    for (const id of TOOL_IDS) {
      const tool = getTool(id);
      expect(tool.howTo.length).toBeGreaterThanOrEqual(3);
      expect(tool.limits.length).toBeGreaterThanOrEqual(2);
      for (const line of [...tool.howTo, ...tool.limits]) {
        expect(line).not.toMatch(DASHES);
      }
    }
  });
});
