/** A UI string from public/_locales, in the browser's language (English when there is no translation). */
export const t = (key: string, ...substitutions: string[]): string =>
  chrome.i18n.getMessage(key, substitutions) || key;
