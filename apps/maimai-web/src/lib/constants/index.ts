import { getDefaultVersion } from "../version";
import { backgroundMapping, logoMapping } from "./pureMapping";

export const defaultVersion = getDefaultVersion();

export function getBackgroundMapping(version: string) {
  return (
    backgroundMapping[version as keyof typeof backgroundMapping] ||
    backgroundMapping[defaultVersion as keyof typeof backgroundMapping]
  );
}

export function getLogoMapping(version: string) {
  return (
    logoMapping[version as keyof typeof logoMapping] ||
    logoMapping[defaultVersion as keyof typeof logoMapping]
  );
}
