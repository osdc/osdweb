const AbsoluteAssetPrefixPattern = /^(?:https?:|data:|blob:)/i;

export function getDesktopPublicBasePath(): string {
  return (process.env.NEXT_PUBLIC_DESKTOP_BASE_PATH || '').trim().replace(/\/$/, '');
}

export function publicPath(path: string): string {
  if (!path) {
    return path;
  }

  if (AbsoluteAssetPrefixPattern.test(path)) {
    return path;
  }

  if (!path.startsWith('/')) {
    return path;
  }

  const basePath = getDesktopPublicBasePath();

  if (!basePath) {
    return path;
  }

  if (path === basePath || path.startsWith(`${basePath}/`)) {
    return path;
  }

  return `${basePath}${path}`;
}
