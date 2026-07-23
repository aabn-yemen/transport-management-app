import { Schema, SchemaOptions } from 'mongoose';

export function createBaseSchema(options?: SchemaOptions): Schema {
  const schemaOptions: SchemaOptions = {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc: any, ret: Record<string, any>) => {
        ret.id = ret._id?.toString();
        delete ret.__v;
        return ret;
      },
    },
    toObject: { virtuals: true },
    ...options,
  };

  const baseSchema = new Schema({}, schemaOptions);

  baseSchema.add({
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    deletedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  });

  baseSchema.pre(/^find/, function (this: any, next) {
    if (!this._conditions?.includeDeleted) {
      this.where({ isDeleted: { $ne: true } });
    }
    next();
  });

  return baseSchema;
}
