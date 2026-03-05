// Ambient module declarations for Next.js generated validator imports
// This file ensures imports referencing the compiled .js files from
// the app directory resolve when using .jsx pages.

// The validator.ts file imports these paths directly as relative
// specifiers. We declare them here with a loose `any` export so that
// TypeScript will treat them as existing modules and not complain about
// missing type information.

declare module "../../app/page.js" {
  const Component: any;
  export default Component;
}

declare module "../../app/layout.js" {
  const Component: any;
  export default Component;
}
