import jwt from 'jsonwebtoken';

describe('Auth Utilities', () => {
  const secret = 'test_secret';
  const payload = { id: 'user123', role: 'admin' };

  it('should sign and verify a JWT token', () => {
    const token = jwt.sign(payload, secret, { expiresIn: '15m' });
    expect(token).toBeDefined();

    const decoded = jwt.verify(token, secret) as any;
    expect(decoded.id).toBe('user123');
    expect(decoded.role).toBe('admin');
  });

  it('should reject an invalid token', () => {
    expect(() => jwt.verify('invalid.token.here', secret)).toThrow();
  });

  it('should reject an expired token', () => {
    const token = jwt.sign(payload, secret, { expiresIn: '0s' });
    expect(() => jwt.verify(token, secret)).toThrow();
  });
});
