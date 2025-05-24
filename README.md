# MonoSchema

This is a monorepo using turbo.

See `./packages/monoschema/README.md` for the MonoSchema README.

# List of active packages:

- `./packages/monoschema`
- `./packages/monoschema-transformer`
- `./packages/monoschema-mongo`

# List of non-active packages (currently example packages to be removed):

- `./apps/docs`
- `./apps/web`
- `./packages/ui`

# TODO

- [x] Change the inferred type so that properties are no longer readonly
- [x] Change the inferred type so that properties decorated with $readonly are readonly on the type inference
- [x] Add support for dates to monoschema
- [x] Add the ability to transform types
- [x] Allow plugins to define pre-validation and post-validation steps (useful for reimplemented version of transform)
- [x] Move type transforming into an extension (in its own library @voidhaus/monoschema-transform)
    - [x] Allow use as a pre-validation step
    - [ ] Allow use as a standalone function - oustanding
- [ ] Check monoschema-mongo support for custom types (e.g. enum)
- [x] Add monoschema-mongo support for ObjectID type
- [x] Add monoschema-mongo support for String<>ObjectID transformers
- [ ] Add monoschema-mongo support for updates
- [ ] Create monoschema-express
