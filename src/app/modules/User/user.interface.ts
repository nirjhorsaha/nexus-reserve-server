/* eslint-disable no-unused-vars */
import { Model } from "mongoose";

export interface IUser {
  name: string;
  email: string;
  password: string;
  phone: string;
  address: string;
  role: 'user' | 'admin';
}


export interface UserModel extends Model<IUser> {
  
  //instance methods for checking if the user exist
  findUserByEmail(email: string): Promise<IUser>;

  //instance methods for checking if passwords are matched
  isPasswordMatched(
    plainTextPassword: string,
    hashedPassword: string,
  ): Promise<boolean>;
}
