import { getDefaultVersion } from "./version";

export const defaultVersion = getDefaultVersion();

export const backgroundMapping = {
  VRS: "/verse_bg.webp",
  XVRS: "/xverse_bg.webp",
  XVRSX: "/xversex_bg.webp",
};

export function getBackgroundMapping(version: string) {
  return (
    backgroundMapping[version as keyof typeof backgroundMapping] ||
    backgroundMapping[defaultVersion as keyof typeof backgroundMapping]
  );
}

export const logoMapping = {
  VRS: "/verse_logo-hq.webp",
  XVRS: "/xverse_logo.webp",
  XVRSX: "/xversex_logo.webp",
};

export function getLogoMapping(version: string) {
  return (
    logoMapping[version as keyof typeof logoMapping] ||
    logoMapping[defaultVersion as keyof typeof logoMapping]
  );
}

export const versionNameMapping = {
  VRS: "VERSE",
  XVRS: "X-VERSE",
  XVRSX: "X-VERSE-X",
};

export function getVersionNameMapping(version: string) {
  return (
    versionNameMapping[version as keyof typeof versionNameMapping] || version
  );
}
