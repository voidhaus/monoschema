export type Constraint = {
  validate: (value: unknown) => boolean | Promise<boolean>;
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

export const url = () => regex(/^(https?:\/\/)?([a-z0-9\-]+\.)+[a-z]{2,}(:\d+)?(\/[^\s]*)?$/i)

export const ipv4 = () => regex(/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/)

// IPv6 regex supporting full, compressed, and loopback forms
export const ipv6 = () => regex(/^((?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|(?:[0-9a-fA-F]{1,4}:){1,7}:|:(:[0-9a-fA-F]{1,4}){1,7}|::1)$/)

export const cidrv4 = () => regex(/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\/([1-2]?[0-9]|3[0]))?$/)

// CIDRv6 regex supporting compressed IPv6 and optional CIDR
export const cidrv6 = () => regex(/^((?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|(?:[0-9a-fA-F]{1,4}:){1,7}:|:(:[0-9a-fA-F]{1,4}){1,7}|::1)(\/(\d|[1-9]\d|1[01]\d|12[0-8]))?$/)

export const mac = () => regex(/^([0-9a-fA-F]{2}[:-]){5}([0-9a-fA-F]{2})$/)

export const uuid = () => regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)

export const guid = () => regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)

export const hex = () => regex(/^#?([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/)


// Base64 constraint using decoding instead of regex
export const base64 = (): Constraint => {
  return {
    validate: (value: unknown) => {
      if (typeof value !== 'string') return false;
      // Only allow valid base64 characters and padding
      if (!/^[A-Za-z0-9+/]+={0,2}$/.test(value)) return false;
      try {
        // Buffer will throw if not valid base64
        // Remove padding for comparison
        const normalized = value.replace(/=+$/, '');
        return Buffer.from(value, 'base64').toString('base64').replace(/=+$/, '') === normalized;
      } catch {
        return false;
      }
    },
    message: (value: unknown) => {
      return `Value ${value} is not a valid base64 string`;
    },
  };
}

export const instanceOf = (ctr: new (...args: unknown[]) => unknown) => {
  return {
    validate: (value: unknown) => {
      return value instanceof ctr;
    },
    message: (value: unknown) => {
      return `Value ${value} is not an instance of ${ctr.name}`;
    },
  };
}
