export const min = (minValue: number) => {
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

export const max = (maxValue: number) => {
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