# MonoSchema

This is a monorepo using turbo.

See `./packages/monoschema/README.md` for the MonoSchema README.

# List of active packages:

- `./packages/monoschema`
- `./packages/monoschema-mongo`

# List of non-active packages (currently example packages to be removed):

- `./apps/docs`
- `./apps/web`
- `./packages/ui`

# TODO

- [x] Change the inferred type so that properties are no longer readonly
- [x] Change the inferred type so that properties decorated with $readonly are readonly on the type inference
- [x] Add support for dates to monoschema
- [ ] Check mongoschema-mongo support for custom types (e.g. enum)
- [ ] Add mongoschema-mongo support for updates
- [ ] Create monoschema-express
