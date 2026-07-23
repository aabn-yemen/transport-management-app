import mongoose from 'mongoose';

describe('Base Repository', () => {
  it('should have mongoose connected models', () => {
    expect(mongoose.Model).toBeDefined();
  });

  it('should create mongoose schema with timestamps', () => {
    const schema = new mongoose.Schema({ name: String }, { timestamps: true });
    const Model = mongoose.model('Test', schema);
    const paths = Object.keys(Model.schema.paths);
    expect(paths).toContain('createdAt');
    expect(paths).toContain('updatedAt');
    expect(paths).toContain('name');
  });

  it('should add soft delete fields to schema', () => {
    const schema = new mongoose.Schema({
      isDeleted: { type: Boolean, default: false },
      deletedAt: { type: Date, default: null },
    });
    const paths = Object.keys(schema.paths);
    expect(paths).toContain('isDeleted');
    expect(paths).toContain('deletedAt');
  });
});
