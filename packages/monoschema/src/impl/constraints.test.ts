import { 
  min, max, minLength, maxLength, regex, email, url, ipv4, ipv6, cidrv4, cidrv6, mac, uuid, guid, hex, base64, instanceOf
} from './constraints';
import { describe, it, expect } from 'vitest';

describe('Constraint functions', () => {
  describe('min', () => {
    it('validates minimum value', () => {
      expect(min(5).validate(5)).toBe(true);
      expect(min(5).validate(6)).toBe(true);
      expect(min(5).validate(4)).toBe(false);
      expect(min(5).validate('5')).toBe(false);
    });
  });

  describe('max', () => {
    it('validates maximum value', () => {
      expect(max(5).validate(5)).toBe(true);
      expect(max(5).validate(4)).toBe(true);
      expect(max(5).validate(6)).toBe(false);
      expect(max(5).validate('5')).toBe(false);
    });
  });

  describe('minLength', () => {
    it('validates minimum length for string and array', () => {
      expect(minLength(3).validate('abc')).toBe(true);
      expect(minLength(3).validate('ab')).toBe(false);
      expect(minLength(3).validate([1,2,3])).toBe(true);
      expect(minLength(3).validate([1,2])).toBe(false);
      expect(minLength(3).validate(123)).toBe(false);
    });
  });

  describe('maxLength', () => {
    it('validates maximum length for string and array', () => {
      expect(maxLength(3).validate('abc')).toBe(true);
      expect(maxLength(3).validate('abcd')).toBe(false);
      expect(maxLength(3).validate([1,2,3])).toBe(true);
      expect(maxLength(3).validate([1,2,3,4])).toBe(false);
      expect(maxLength(3).validate(123)).toBe(false);
    });
  });

  describe('regex', () => {
    it('validates regex pattern', () => {
      const constraint = regex(/^abc$/);
      expect(constraint.validate('abc')).toBe(true);
      expect(constraint.validate('abcd')).toBe(false);
      expect(constraint.validate(123)).toBe(false);
    });
  });

  describe('email', () => {
    it('validates email addresses', () => {
      expect(email().validate('test@example.com')).toBe(true);
      expect(email().validate('test.email+alex@leetcode.com')).toBe(true);
      expect(email().validate('test@.com')).toBe(false);
      expect(email().validate('test@com')).toBe(false);
    });
  });

  describe('url', () => {
    it('validates URLs', () => {
      expect(url().validate('http://example.com')).toBe(true);
      expect(url().validate('https://example.com')).toBe(true);
      expect(url().validate('example.com')).toBe(true);
      expect(url().validate('ftp://example.com')).toBe(false);
    });
  });

  describe('ipv4', () => {
    it('validates IPv4 addresses', () => {
      expect(ipv4().validate('192.168.1.1')).toBe(true);
      expect(ipv4().validate('255.255.255.255')).toBe(true);
      expect(ipv4().validate('256.0.0.1')).toBe(false);
      expect(ipv4().validate('abc.def.ghi.jkl')).toBe(false);
    });
  });

  describe('ipv6', () => {
    it('validates IPv6 addresses', () => {
      expect(ipv6().validate('2001:0db8:85a3:0000:0000:8a2e:0370:7334')).toBe(true);
      expect(ipv6().validate('::1')).toBe(true);
      expect(ipv6().validate('1234')).toBe(false);
    });
  });

  describe('cidrv4', () => {
    it('validates CIDR IPv4', () => {
      expect(cidrv4().validate('192.168.1.1/24')).toBe(true);
      expect(cidrv4().validate('10.0.0.1')).toBe(true);
      expect(cidrv4().validate('256.0.0.1/24')).toBe(false);
    });
  });

  describe('cidrv6', () => {
    it('validates CIDR IPv6', () => {
      expect(cidrv6().validate('2001:db8::/32')).toBe(true);
      expect(cidrv6().validate('2001:db8::')).toBe(true);
      expect(cidrv6().validate('1234')).toBe(false);
    });
  });

  describe('mac', () => {
    it('validates MAC addresses', () => {
      expect(mac().validate('00:1A:2B:3C:4D:5E')).toBe(true);
      expect(mac().validate('00-1A-2B-3C-4D-5E')).toBe(true);
      expect(mac().validate('001A2B3C4D5E')).toBe(false);
    });
  });

  describe('uuid', () => {
    it('validates UUIDs', () => {
      expect(uuid().validate('123e4567-e89b-12d3-a456-426614174000')).toBe(true);
      expect(uuid().validate('123e4567-e89b-12d3-a456-42661417400Z')).toBe(false);
    });
  });

  describe('guid', () => {
    it('validates GUIDs', () => {
      expect(guid().validate('123e4567-e89b-12d3-a456-426614174000')).toBe(true);
      expect(guid().validate('123e4567-e89b-12d3-a456-42661417400Z')).toBe(false);
    });
  });

  describe('hex', () => {
    it('validates hex colors', () => {
      expect(hex().validate('#fff')).toBe(true);
      expect(hex().validate('#ffffff')).toBe(true);
      expect(hex().validate('fff')).toBe(true);
      expect(hex().validate('12345')).toBe(false);
    });
  });

  describe('base64', () => {
    it('validates base64 strings', () => {
      expect(base64().validate('U29tZSBkYXRh')).toBe(true);
      expect(base64().validate('U29tZSBkYXRh==')).toBe(true);
      expect(base64().validate('not base64')).toBe(false);
    });
  });

  describe('instanceOf', () => {
    it('validates instance of a class', () => {
      class Foo {}
      class Bar {}
      const foo = new Foo();
      const bar = new Bar();
      expect(instanceOf(Foo).validate(foo)).toBe(true);
      expect(instanceOf(Foo).validate(bar)).toBe(false);
      expect(instanceOf(Foo).validate({})).toBe(false);
    });
  });
});
