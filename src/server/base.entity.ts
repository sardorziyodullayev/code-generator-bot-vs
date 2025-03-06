import mongoose from 'mongoose';

export class BaseEntity {
  _id: mongoose.Types.ObjectId;

  deletedBy: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
