export const stringToNumber = () => {
  return {
    input: String,
    output: Number,
    transform: (value: string): number => {
      const num = Number(value);
      if (isNaN(num)) {
        throw new Error(`Cannot convert ${JSON.stringify(value)} to a number`);
      }
      return num;
    },
  }
}

export const stringToBoolean = () => {
  return {
    input: String,
    output: Boolean,
    transform: (value: string): boolean => {
      if (value.toLowerCase() === 'true') {
        return true;
      } else if (value.toLowerCase() === 'false') {
        return false;
      }
      throw new Error(`Cannot convert ${JSON.stringify(value)} to a boolean`);
    },
  }
}

export const stringToDate = () => {
  return {
    input: String,
    output: Date,
    transform: (value: string): Date => {
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        throw new Error(`Cannot convert ${JSON.stringify(value)} to a Date`);
      }
      return date;
    },
  }
}

export const numberToString = () => {
  return {
    input: Number,
    output: String,
    transform: (value: number): string => {
      return value.toString();
    },
  }
}

export const booleanToString = () => {
  return {
    input: Boolean,
    output: String,
    transform: (value: boolean): string => {
      return value ? 'true' : 'false';
    },
  }
}

export const dateToString = () => {
  return {
    input: Date,
    output: String,
    transform: (value: Date): string => {
      return value.toISOString();
    },
  }
}