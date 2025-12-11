import { error } from "@sveltejs/kit";

import { env } from "$env/dynamic/public";

export function getEnabledVersions() {
  if (!env.PUBLIC_ENABLED_VERSION) {
    error(503, "Server misconfigured: PUBLIC_ENABLED_VERSION is not set");
  }

  const versions = env.PUBLIC_ENABLED_VERSION.split(",");
  if (versions.length === 0) {
    error(503, "Server misconfigured: PUBLIC_ENABLED_VERSION is empty");
  }

  return versions;
}

export function getDefaultVersion() {
  const versions = getEnabledVersions();

  const defaultVersion = env.PUBLIC_DEFAULT_VERSION;

  if (defaultVersion && versions.includes(defaultVersion)) {
    return defaultVersion;
  } else {
    error(503, "Server misconfigured: PUBLIC_DEFAULT_VERSION is invalid");
  }
}
