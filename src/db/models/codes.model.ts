import { getModelForClass, index, modelOptions, prop } from '@typegoose/typegoose';
import { Types } from 'mongoose';
import { COLLECTIONS } from '../../common/constant/tables';

@modelOptions({
  schemaOptions: {
    collection: COLLECTIONS.codeLogs,
    toObject: {
      virtuals: true,
    },
    timestamps: true,
  },
})
@index({ value: 1 }, { unique: true })
export class Code {
  _id!: Types.ObjectId;

  @prop({ unique: true, type: Number })
  id!: number;

  @prop({ type: String })
  value!: string;

  @prop({ type: Number })
  version!: number;

  @prop({ type: Types.ObjectId, default: null })
  giftId!: Types.ObjectId | null;

  @prop({ type: Boolean, default: false })
  isUsed!: boolean;

  @prop({ default: null })
  usedById!: Types.ObjectId | null;

  @prop({ type: String, default: null })
  usedAt!: string | null;

  @prop({ type: String, default: null })
  giftGivenAt!: string | null;

  @prop({ type: Types.ObjectId, default: null })
  giftGivenBy!: string | null;

  @prop({ type: Types.ObjectId, default: null })
  deletedBy!: string | null;

  @prop({ type: String, default: null })
  deletedAt: string = null;

  updatedAt: string;
  createdAt: string;
}

export const CodeModel = getModelForClass(Code);
