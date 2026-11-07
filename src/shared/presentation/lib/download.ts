/** Minimal DOM surface used to save a file; injectable for tests. */
export interface DownloadEnv {
  createObjectURL: (blob: Blob) => string;
  revokeObjectURL: (url: string) => void;
  clickLink: (href: string, filename: string) => void;
}

const browserEnv = (): DownloadEnv => ({
  createObjectURL: (blob) => URL.createObjectURL(blob),
  revokeObjectURL: (url) => URL.revokeObjectURL(url),
  clickLink: (href, filename) => {
    const link = document.createElement('a');
    link.href = href;
    link.download = filename;
    link.click();
  },
});

/** Saves a blob as a file and releases its object URL right after. */
export function downloadBlob(
  filename: string,
  blob: Blob,
  env: DownloadEnv = browserEnv()
): void {
  const url = env.createObjectURL(blob);
  try {
    env.clickLink(url, filename);
  } finally {
    env.revokeObjectURL(url);
  }
}

/** Saves text as a UTF-8 file. */
export function downloadText(
  filename: string,
  text: string,
  type = 'text/plain;charset=utf-8',
  env?: DownloadEnv
): void {
  downloadBlob(filename, new Blob([text], { type }), env);
}
