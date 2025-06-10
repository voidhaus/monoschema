export const ContentKeyObject = Object.assign(
  () => ({
    validate: async (value: unknown) => {
      // Check if value is a string
      if (typeof value !== 'string') {
        return {
          valid: false,
          errors: [
            {
              message: "Expected a string for content key",
              expected: "string",
              received: typeof value,
              value,
            },
          ],
        };
      }
      // Check if string is not empty
      if (value.trim() === '') {
        return {
          valid: false,
          errors: [
            {
              message: "Content key cannot be an empty string",
              expected: "non-empty string",
              received: "empty string",
              value,
            },
          ],
        };
      }
      return {
        valid: true,
        errors: [],
      };
    },
  }),
  { tsType: null as unknown as string },
)