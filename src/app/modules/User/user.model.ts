import { Schema, model } from 'mongoose';
import { IUser } from './user.interface';

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
  },
  { timestamps: true },
);


// Middleware for pre-saving actions
// userSchema.pre<IUser>('save', async function (next) {
//     const user = this; // 'this' refers to the document being saved
  
//     // Hashing password and save into DB
//     user.password = await bcrypt.hash(user.password, Number(config.bcrypt_salt_rounds));
  
//     next();
//   });
  
//   // Middleware for post-saving actions
//   userSchema.post<IUser>('save', function (doc, next) {
//     doc.password = ''; // Clear password after saving
//     next();
//   });


export const User = model<IUser>('User', userSchema);
