import { userService } from "./user.service";
import { Request, Response } from 'express';


const signUp = async (req: Request, res: Response) => {
    try {
      const user = await userService.createUser(req.body);
      res.status(201).json({
        success: true,
        statusCode: 201,
        message: 'User registered successfully',
        data: {
          ...user.toObject(),
          password: req.body?.password 
        }
      });
    } catch (error:any) {
      res.status(500).json({
        success: false,
        statusCode: 500,
        message: error.message,
      });
    }
};
  
export const userController = {
    signUp
}