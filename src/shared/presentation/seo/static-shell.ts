import {
  getTool,
  toolCategories,
} from '@/shared/presentation/tools/tool-registry';

import type { SeoPage } from './seo-pages';
import {
  OFFLINE_STEPS as OFFLINE_STEP_TEXT,
  RELEASES_URL,
  REPO_URL,
  SITE_NAME,
} from './site-config';

/*
 * Static HTML placed inside #root of each prerendered page, so crawlers that
 * do not run JavaScript get the same heading and copy users see. React's
 * createRoot replaces it on mount. Class names live in src/ so Tailwind
 * generates them; they mirror PageContainer / PageTitle / PageDescription.
 */

const CONTAINER =
  'mx-auto w-full max-w-7xl px-4 pt-6 pb-20 sm:px-6 sm:pt-10 lg:px-8';
const TITLE =
  'font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl';
const LEAD =
  'mt-3 max-w-[65ch] text-base leading-relaxed text-muted-foreground sm:text-lg';
const SECTION_TITLE = 'mt-10 text-lg font-semibold tracking-tight';
const LIST = 'mt-3 max-w-[65ch] list-inside space-y-1.5 text-muted-foreground';
const LINK = 'text-accent-strong underline-offset-4 hover:underline';

const escape = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const link = (href: string, label: string) =>
  `<a class="${LINK}" href="${escape(href)}">${escape(label)}</a>`;

const list = (items: readonly string[], ordered = false) => {
  const tag = ordered ? 'ol' : 'ul';
  const marker = ordered ? 'list-decimal' : 'list-disc';
  return `<${tag} class="${LIST} ${marker}">${items
    .map((item) => `<li>${item}</li>`)
    .join('')}</${tag}>`;
};

const OFFLINE_STEPS = OFFLINE_STEP_TEXT.map((step) =>
  escape(step).replace('GitHub', link(RELEASES_URL, 'GitHub'))
);

function toolBody(page: SeoPage): string {
  const tool = getTool(page.toolId!);
  return [
    `<h2 class="${SECTION_TITLE}">How to use</h2>`,
    list(tool.howTo.map(escape), true),
    `<h2 class="${SECTION_TITLE}">Limits</h2>`,
    list(tool.limits.map(escape)),
    `<h2 class="${SECTION_TITLE}">Use it offline</h2>`,
    list(OFFLINE_STEPS, true),
    `<h2 class="${SECTION_TITLE}">Related tools</h2>`,
    list(tool.related.map((id) => link(getTool(id).path, getTool(id).heading))),
    `<p class="mt-10">${link('/tools', `All ${SITE_NAME} tools`)}</p>`,
  ].join('');
}

function catalogBody(): string {
  return toolCategories
    .map(
      (category) =>
        `<h2 class="${SECTION_TITLE}">${escape(category.title)}</h2>` +
        list(
          category.tools.map(
            (tool) =>
              `${link(tool.path, tool.heading)}: ${escape(tool.summary)}.`
          )
        )
    )
    .join('');
}

function homeBody(): string {
  return (
    `<h2 class="${SECTION_TITLE}">Tools</h2>` +
    list(
      toolCategories.flatMap((category) =>
        category.tools.map(
          (tool) => `${link(tool.path, tool.heading)}: ${escape(tool.summary)}.`
        )
      )
    ) +
    `<h2 class="${SECTION_TITLE}">Use it offline</h2>` +
    list(OFFLINE_STEPS, true) +
    `<p class="mt-10">${link(REPO_URL, 'Source code on GitHub')} (MIT license)</p>`
  );
}

export function renderStaticShell(page: SeoPage): string {
  const body =
    page.kind === 'tool'
      ? toolBody(page)
      : page.kind === 'catalog'
        ? catalogBody()
        : homeBody();
  return `<main class="${CONTAINER}"><h1 class="${TITLE}">${escape(page.heading)}</h1><p class="${LEAD}">${escape(page.intro)}</p>${body}</main>`;
}

export function renderNotFoundShell(): string {
  return `<main class="${CONTAINER}"><h1 class="${TITLE}">Page not found.</h1><p class="${LEAD}">The address does not match any page of ${SITE_NAME}.</p><p class="mt-6">${link('/tools', 'All tools')} · ${link('/', 'Home')}</p></main>`;
}
