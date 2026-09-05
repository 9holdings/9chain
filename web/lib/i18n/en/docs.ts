/** The documentation index (`/docs/`). */
export const EN_DOCS = {
  /**
   * `/docs/` — the catalogue. The document titles and summaries are NOT here on purpose: they
   * describe documents that exist in one language each, and a translated summary above an
   * English guide promises a translation that does not exist. See `lib/docs.ts`.
   */
  docs: {
    title: 'Documentation',
    desc:
      'Everything written down about running on A1: how to launch a chain, how to run a ' +
      'validator, and what the project is for. Each document is linked where it actually ' +
      'lives, so what you read is the copy that gets edited.',
    langNote:
      'Each document is in the language marked on its row, and we do not translate the ' +
      'documents themselves. A translated copy stays correct only until somebody fixes a ' +
      'command in the original — and the copy nobody edits is the one that goes wrong.',
    langLabel: 'Language',
    alsoIn: 'Also in',
    pdfLabel: 'PDF',
    onSiteLabel: 'On this site',
    opensGithub: 'Opens on GitHub',
  },
};
