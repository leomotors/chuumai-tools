# Instruction for Chuumai Tools Monorepo

## Linting

In each app/package or root level, `pnpm lint` and `pnpm format` can be used.
However, you don't have to run those command to save time, human will do that.

## Website Part (apps/chuni-web)

The application is written using SvelteKit.

### UI Library

It also uses shadcn-svelte as UI library and all UI components are located in `packages/ui` package.

**Important**: to add a new component if not exists,
you can use `pnpm dlx shadcn-svelte add ...` inside `packages/ui` folder.
Since the folder structure is not standard to shadcn, the added components will be
located in `src/components/ui` which is not expected location.
Please move it to under either `src/atom` or `src/molecule` etc to match the design system structure.
Then make sure you fix the utils imports (`$lib/utils.js` should be `@repo/ui/utils`).
Finally, cleanup empty `src/components` folder.
