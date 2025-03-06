import { getModelForClass, index, modelOptions, mongoose, prop } from '@typegoose/typegoose';
import { COLLECTIONS } from '../../common/constant/tables';

export enum Gender {
  Male = 'MALE',
  Female = 'FEMALE',
  NotSet = 'NOT_SET',
}

export enum UserStatus {
  ACTIVE = 'active',
  BLOCK = 'block',
}
@modelOptions({
  schemaOptions: {
    collection: COLLECTIONS.users,
    toObject: {
      virtuals: true,
    },
    timestamps: true,
  },
})
@index({ tgId: 1, deletedAt: 1 }, { unique: true })
export class User {
  @prop({ _id: true })
  _id!: mongoose.Types.ObjectId;

  @prop()
  id!: number;

  @prop({ required: true })
  tgId!: number;

  @prop({ default: '' })
  lang!: string;

  @prop({ required: true })
  tgFirstName!: string;

  @prop({ default: '', trim: true })
  tgLastName?: string;

  @prop({ default: '', trim: true })
  tgUsername: string;

  @prop({ default: null, trim: true, minlength: 3 })
  username: string;

  @prop({ default: null, trim: true })
  password: string;

  @prop({ type: String, default: '', trim: true })
  firstName!: string;

  @prop({ default: '', trim: true })
  lastName?: string;

  @prop({ trim: true })
  phoneNumber?: string;

  @prop({ default: null })
  otp?: string;

  @prop({ default: null })
  otpSend?: Date;

  @prop({ default: 0 })
  otpRetry?: number;

  @prop({ default: Gender.NotSet })
  gender!: Gender;

  @prop({ default: null })
  birthday?: string;

  @prop({ default: null })
  image?: string;

  @prop({ default: UserStatus.ACTIVE })
  status!: UserStatus;

  @prop({ default: 0 })
  balance!: number;

  @prop({ default: new Date().toISOString() })
  lastUseAt!: string;

  updatedAt: string;
  createdAt: string;

  @prop({ type: mongoose.Types.ObjectId, default: null })
  deletedBy!: string | null;

  @prop({ type: String, default: null })
  deletedAt: string = null;

  public static async getUser(query: mongoose.FilterQuery<User>): Promise<User | null> {
    return await UserModel.findOne(query).lean();
  }
  public static async updateUser(
    query: mongoose.FilterQuery<User>,
    data: mongoose.FilterQuery<User>,
  ): Promise<User | null> {
    return await UserModel.findOneAndUpdate(query, data, {
      new: true,
      lean: true,
    });
  }

  public static async saveUser(data: mongoose.FilterQuery<User>): Promise<User> {
    return await new UserModel(data).save();
  }
}

export const UserModel = getModelForClass(User);
