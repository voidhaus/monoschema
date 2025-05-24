import { describe, it, expect } from 'vitest';
import {
  stringToNumber,
  stringToBoolean,
  stringToDate,
  numberToString,
  booleanToString,
  dateToString
} from './transformers';

describe('String to Type Transformers', () => {
  describe('stringToNumber', () => {
    const transformer = stringToNumber();

    it('should have correct input and output types', () => {
      expect(transformer.input).toBe(String);
      expect(transformer.output).toBe(Number);
    });

    it('should convert valid numeric strings to numbers', () => {
      expect(transformer.transform('123')).toBe(123);
      expect(transformer.transform('123.45')).toBe(123.45);
      expect(transformer.transform('-123')).toBe(-123);
      expect(transformer.transform('0')).toBe(0);
      expect(transformer.transform('0.0')).toBe(0);
    });

    it('should convert scientific notation strings', () => {
      expect(transformer.transform('1e3')).toBe(1000);
      expect(transformer.transform('1.23e-4')).toBe(0.000123);
    });

    it('should handle edge cases', () => {
      expect(transformer.transform('Infinity')).toBe(Infinity);
      expect(transformer.transform('-Infinity')).toBe(-Infinity);
    });

    it('should throw error for invalid numeric strings', () => {
      expect(() => transformer.transform('abc')).toThrow('Cannot convert "abc" to a number');
      expect(() => transformer.transform('123abc')).toThrow('Cannot convert "123abc" to a number');
      expect(() => transformer.transform('NaN')).toThrow('Cannot convert "NaN" to a number');
    });

    it('should handle empty and whitespace strings as zero', () => {
      expect(transformer.transform('')).toBe(0); // Number('') returns 0
      expect(transformer.transform('   ')).toBe(0); // Number('   ') returns 0
    });

    it('should handle whitespace strings', () => {
      expect(transformer.transform(' 123 ')).toBe(123); // Number() trims whitespace
    });
  });

  describe('stringToBoolean', () => {
    const transformer = stringToBoolean();

    it('should have correct input and output types', () => {
      expect(transformer.input).toBe(String);
      expect(transformer.output).toBe(Boolean);
    });

    it('should convert "true" to true (case insensitive)', () => {
      expect(transformer.transform('true')).toBe(true);
      expect(transformer.transform('TRUE')).toBe(true);
      expect(transformer.transform('True')).toBe(true);
      expect(transformer.transform('tRuE')).toBe(true);
    });

    it('should convert "false" to false (case insensitive)', () => {
      expect(transformer.transform('false')).toBe(false);
      expect(transformer.transform('FALSE')).toBe(false);
      expect(transformer.transform('False')).toBe(false);
      expect(transformer.transform('fAlSe')).toBe(false);
    });

    it('should throw error for invalid boolean strings', () => {
      expect(() => transformer.transform('1')).toThrow('Cannot convert "1" to a boolean');
      expect(() => transformer.transform('0')).toThrow('Cannot convert "0" to a boolean');
      expect(() => transformer.transform('yes')).toThrow('Cannot convert "yes" to a boolean');
      expect(() => transformer.transform('no')).toThrow('Cannot convert "no" to a boolean');
      expect(() => transformer.transform('')).toThrow('Cannot convert "" to a boolean');
      expect(() => transformer.transform('null')).toThrow('Cannot convert "null" to a boolean');
    });

    it('should throw error for strings with whitespace', () => {
      expect(() => transformer.transform(' true')).toThrow('Cannot convert " true" to a boolean');
      expect(() => transformer.transform('true ')).toThrow('Cannot convert "true " to a boolean');
      expect(() => transformer.transform(' false ')).toThrow('Cannot convert " false " to a boolean');
    });
  });

  describe('stringToDate', () => {
    const transformer = stringToDate();

    it('should have correct input and output types', () => {
      expect(transformer.input).toBe(String);
      expect(transformer.output).toBe(Date);
    });

    it('should convert valid ISO date strings', () => {
      const isoString = '2023-12-25T10:30:00.000Z';
      const result = transformer.transform(isoString);
      expect(result).toBeInstanceOf(Date);
      expect(result.toISOString()).toBe(isoString);
    });

    it('should convert various valid date formats', () => {
      expect(transformer.transform('2023-12-25')).toBeInstanceOf(Date);
      expect(transformer.transform('December 25, 2023')).toBeInstanceOf(Date);
      expect(transformer.transform('12/25/2023')).toBeInstanceOf(Date);
      expect(transformer.transform('2023-12-25T10:30:00')).toBeInstanceOf(Date);
    });

    it('should throw error for invalid date strings', () => {
      expect(() => transformer.transform('invalid-date')).toThrow('Cannot convert "invalid-date" to a Date');
      expect(() => transformer.transform('2023-13-45')).toThrow('Cannot convert "2023-13-45" to a Date');
      expect(() => transformer.transform('')).toThrow('Cannot convert "" to a Date');
      expect(() => transformer.transform('abc')).toThrow('Cannot convert "abc" to a Date');
    });

    it('should handle edge cases', () => {
      // Valid edge cases
      expect(transformer.transform('1970-01-01T00:00:00.000Z')).toBeInstanceOf(Date);
      
      // Invalid edge cases
      expect(() => transformer.transform('NaN')).toThrow('Cannot convert "NaN" to a Date');
    });
  });
});

describe('Type to String Transformers', () => {
  describe('numberToString', () => {
    const transformer = numberToString();

    it('should have correct input and output types', () => {
      expect(transformer.input).toBe(Number);
      expect(transformer.output).toBe(String);
    });

    it('should convert integers to strings', () => {
      expect(transformer.transform(123)).toBe('123');
      expect(transformer.transform(-123)).toBe('-123');
      expect(transformer.transform(0)).toBe('0');
    });

    it('should convert floating point numbers to strings', () => {
      expect(transformer.transform(123.45)).toBe('123.45');
      expect(transformer.transform(-123.45)).toBe('-123.45');
      expect(transformer.transform(0.123)).toBe('0.123');
    });

    it('should handle special numeric values', () => {
      expect(transformer.transform(Infinity)).toBe('Infinity');
      expect(transformer.transform(-Infinity)).toBe('-Infinity');
      expect(transformer.transform(NaN)).toBe('NaN');
    });

    it('should handle scientific notation', () => {
      expect(transformer.transform(1e3)).toBe('1000');
      expect(transformer.transform(1.23e-4)).toBe('0.000123');
    });

    it('should handle very large and small numbers', () => {
      expect(transformer.transform(Number.MAX_VALUE)).toBe(Number.MAX_VALUE.toString());
      expect(transformer.transform(Number.MIN_VALUE)).toBe(Number.MIN_VALUE.toString());
    });
  });

  describe('booleanToString', () => {
    const transformer = booleanToString();

    it('should have correct input and output types', () => {
      expect(transformer.input).toBe(Boolean);
      expect(transformer.output).toBe(String);
    });

    it('should convert true to "true"', () => {
      expect(transformer.transform(true)).toBe('true');
    });

    it('should convert false to "false"', () => {
      expect(transformer.transform(false)).toBe('false');
    });
  });

  describe('dateToString', () => {
    const transformer = dateToString();

    it('should have correct input and output types', () => {
      expect(transformer.input).toBe(Date);
      expect(transformer.output).toBe(String);
    });

    it('should convert Date to ISO string', () => {
      const date = new Date('2023-12-25T10:30:00.000Z');
      expect(transformer.transform(date)).toBe('2023-12-25T10:30:00.000Z');
    });

    it('should handle current date', () => {
      const now = new Date();
      const result = transformer.transform(now);
      expect(result).toBe(now.toISOString());
      expect(typeof result).toBe('string');
    });

    it('should handle epoch date', () => {
      const epoch = new Date(0);
      expect(transformer.transform(epoch)).toBe('1970-01-01T00:00:00.000Z');
    });

    it('should handle various dates', () => {
      const dates = [
        new Date('1999-12-31T23:59:59.999Z'),
        new Date('2000-01-01T00:00:00.000Z'),
        new Date('2024-02-29T12:00:00.000Z'), // leap year
      ];

      dates.forEach(date => {
        const result = transformer.transform(date);
        expect(typeof result).toBe('string');
        expect(result).toBe(date.toISOString());
      });
    });
  });
});

describe('Transformer Integration', () => {
  it('should be reversible for string <-> number transformations', () => {
    const numbers = [0, 123, -456, 123.45, -678.9];
    const stringToNum = stringToNumber();
    const numToString = numberToString();

    numbers.forEach(num => {
      const stringified = numToString.transform(num);
      const parsed = stringToNum.transform(stringified);
      expect(parsed).toBe(num);
    });
  });

  it('should be reversible for string <-> boolean transformations', () => {
    const booleans = [true, false];
    const stringToBool = stringToBoolean();
    const boolToString = booleanToString();

    booleans.forEach(bool => {
      const stringified = boolToString.transform(bool);
      const parsed = stringToBool.transform(stringified);
      expect(parsed).toBe(bool);
    });
  });

  it('should be reversible for string <-> date transformations', () => {
    const dates = [
      new Date('2023-12-25T10:30:00.000Z'),
      new Date(0),
      new Date('1999-12-31T23:59:59.999Z')
    ];
    const stringToDateTransformer = stringToDate();
    const dateToStringTransformer = dateToString();

    dates.forEach(date => {
      const stringified = dateToStringTransformer.transform(date);
      const parsed = stringToDateTransformer.transform(stringified);
      expect(parsed.getTime()).toBe(date.getTime());
    });
  });
});
