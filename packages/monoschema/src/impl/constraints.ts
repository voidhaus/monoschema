export type Constraint = {
  validate: (value: unknown) => boolean;
  message: (value: unknown) => string;
}

export const min = (minValue: number): Constraint => {
  return {
    validate: (value: unknown) => {
      if (typeof value === "number") {
        return value >= minValue;
      }
      return false;
    },
    message: (value: unknown) => {
      if (typeof value === "number") {
        return `Value ${value} is less than minimum ${minValue}`;
      }
      return `Value is not a number`;
    },
  };
}

export const max = (maxValue: number): Constraint => {
  return {
    validate: (value: unknown) => {
      if (typeof value === "number") {
        return value <= maxValue;
      }
      return false;
    },
    message: (value: unknown) => {
      if (typeof value === "number") {
        return `Value ${value} is greater than maximum ${maxValue}`;
      }
      return `Value is not a number`;
    },
  };
}

export const minLength = (minLength: number): Constraint => {
  return {
    validate: (value: unknown) => {
      if (typeof value === "string") {
        return value.length >= minLength;
      }
      if (Array.isArray(value)) {
        return value.length >= minLength;
      }
      return false;
    },
    message: (value: unknown) => {
      if (typeof value === "string") {
        return `String length ${value.length} is less than minimum ${minLength}`;
      }
      if (Array.isArray(value)) {
        return `Array length ${value.length} is less than minimum ${minLength}`;
      }
      return `Value is not a string or array`;
    },
  };
}

export const maxLength = (maxLength: number): Constraint => {
  return {
    validate: (value: unknown) => {
      if (typeof value === "string") {
        return value.length <= maxLength;
      }
      if (Array.isArray(value)) {
        return value.length <= maxLength;
      }
      return false;
    },
    message: (value: unknown) => {
      if (typeof value === "string") {
        return `String length ${value.length} is greater than maximum ${maxLength}`;
      }
      if (Array.isArray(value)) {
        return `Array length ${value.length} is greater than maximum ${maxLength}`;
      }
      return `Value is not a string or array`;
    },
  };
}

export const regex = (pattern: RegExp): Constraint => {
  return {
    validate: (value: unknown) => {
      if (typeof value === "string") {
        return pattern.test(value);
      }
      return false;
    },
    message: (value: unknown) => {
      if (typeof value === "string") {
        return `String ${value} does not match pattern ${pattern}`;
      }
      return `Value is not a string`;
    },
  };
}

export const email = () => regex(/^(?!\.)(?!.*\.\.)([a-z0-9_'+\-\.]*)[a-z0-9_+-]@([a-z0-9][a-z0-9\-]*\.)+[a-z]{2,}$/i)