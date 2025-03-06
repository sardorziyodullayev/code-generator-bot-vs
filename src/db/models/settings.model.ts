import { getModelForClass, index, modelOptions, prop } from '@typegoose/typegoose';
import mongoose from 'mongoose';
import { COLLECTIONS } from '../../common/constant/tables';

class CodeLimitPerUser {
  @prop({ type: Boolean, default: false })
  status: boolean;

  @prop({ type: Number, default: 0 })
  value: number;
}

@modelOptions({
  schemaOptions: {
    collection: COLLECTIONS.settings,
    toObject: {
      virtuals: true,
    },
    timestamps: true,
  },
})
@index({ value: 1 }, { unique: true })
export class Settings {
  _id!: mongoose.Types.ObjectId;

  @prop()
  codeLimitPerUser!: CodeLimitPerUser;

  @prop({ type: mongoose.Types.ObjectId, default: null })
  deletedBy!: string | null;

  @prop({ type: String, default: null })
  deletedAt: string;

  updatedAt: string;
  createdAt: string;
}

export const SettingsModel = getModelForClass(Settings);
