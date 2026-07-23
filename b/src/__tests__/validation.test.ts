describe('Validation Logic', () => {
  it('should validate student number format', () => {
    const pattern = /^STU-\d{4}-\d{3}$/;
    expect(pattern.test('STU-2024-001')).toBe(true);
    expect(pattern.test('STU-2024-1234')).toBe(false);
    expect(pattern.test('INVALID')).toBe(false);
  });

  it('should validate driver number format', () => {
    const pattern = /^DRV-\d{3}$/;
    expect(pattern.test('DRV-001')).toBe(true);
    expect(pattern.test('DRV-999')).toBe(true);
    expect(pattern.test('DRV-1000')).toBe(false);
  });

  it('should validate trip number format', () => {
    const pattern = /^TRP-\d{3}$/;
    expect(pattern.test('TRP-001')).toBe(true);
    expect(pattern.test('TRP-999')).toBe(true);
  });

  it('should validate route code format', () => {
    const pattern = /^RTE-\d{3}$/;
    expect(pattern.test('RTE-001')).toBe(true);
    expect(pattern.test('RTE-999')).toBe(true);
  });

  it('should validate bus number format', () => {
    const pattern = /^BUS-\d{3}$/;
    expect(pattern.test('BUS-001')).toBe(true);
    expect(pattern.test('BUS-999')).toBe(true);
  });

  it('should validate email format', () => {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    expect(pattern.test('user@example.com')).toBe(true);
    expect(pattern.test('admin@university.edu')).toBe(true);
    expect(pattern.test('invalid')).toBe(false);
  });

  it('should validate phone number format', () => {
    const pattern = /^05\d{8}$/;
    expect(pattern.test('0550000001')).toBe(true);
    expect(pattern.test('0560000002')).toBe(true);
    expect(pattern.test('1234567890')).toBe(false);
  });
});
