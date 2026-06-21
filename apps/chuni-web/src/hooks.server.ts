import type { Handle } from "@sveltejs/kit";

let authHandlePromise: Promise<Handle> | undefined;

function getAuthHandle() {
  return (authHandlePromise ??= import("$lib/auth").then(
    ({ handle }) => handle,
  ));
}

export const handle: Handle = async (input) => {
  const authHandle = await getAuthHandle();
  return authHandle(input);
};
