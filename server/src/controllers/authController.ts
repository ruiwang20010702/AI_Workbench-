import { Request, Response } from 'express';
import { UserModel } from '../models/User';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { LoginRequest, RegisterRequest, AuthResponse } from '../types';

export class AuthController {
  // 用户注册
  static async register(req: Request, res: Response): Promise<Response | void> {
    try {
      const { username, email, password }: RegisterRequest = req.body;

      // 检查邮箱是否已存在
      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: '该邮箱已被注册'
        });
      }

      // 加密密码
      const hashedPassword = await hashPassword(password);

      // 创建用户
      const user = await UserModel.create({
        email,
        password_hash: hashedPassword,
        display_name: username
      });

      // 生成JWT令牌
      const token = generateToken(user);

      // 返回用户信息（不包含密码哈希）
      const { password_hash, ...userWithoutPassword } = user;

      const response: AuthResponse = {
        success: true,
        message: '注册成功',
        data: {
          user: userWithoutPassword,
          token
        }
      };

      res.status(201).json(response);
    } catch (error) {
      console.error('注册错误:', error);
      return res.status(500).json({
        success: false,
        message: '服务器内部错误'
      });
    }
  }

  // 用户登录
  static async login(req: Request, res: Response): Promise<Response | void> {
    try {
      const { email, password }: LoginRequest = req.body;

      // 查找用户
      const user = await UserModel.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: '邮箱或密码错误'
        });
      }

      // 验证密码
      const isPasswordValid = await comparePassword(password, user.password_hash);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: '邮箱或密码错误'
        });
      }

      // 生成JWT令牌
      const token = generateToken(user);

      // 返回用户信息（不包含密码哈希）
      const { password_hash, ...userWithoutPassword } = user;

      const response: AuthResponse = {
        success: true,
        message: '登录成功',
        data: {
          user: userWithoutPassword,
          token
        }
      };

      res.json(response);
    } catch (error) {
      console.error('登录错误:', error);
      return res.status(500).json({
        success: false,
        message: '服务器内部错误'
      });
    }
  }

  // 获取当前用户信息
  static async getCurrentUser(req: Request, res: Response): Promise<Response | void> {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: '未认证的用户'
        });
      }

      res.json({
        success: true,
        message: '获取用户信息成功',
        data: {
          user: req.user
        }
      });
    } catch (error) {
      console.error('获取用户信息错误:', error);
      return res.status(500).json({
        success: false,
        message: '服务器内部错误'
      });
    }
  }

  // 更新用户信息
  static async updateProfile(req: Request, res: Response): Promise<Response | void> {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: '未认证的用户'
        });
      }

      const { username } = req.body;
      
      if (!username || username.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: '用户名不能为空'
        });
      }

      // 更新用户信息
      const updatedUser = await UserModel.update(req.user!.id, { display_name: username });

      res.json({
        success: true,
        message: '用户信息更新成功',
        data: {
          user: updatedUser
        }
      });
    } catch (error) {
      console.error('更新用户信息错误:', error);
      return res.status(500).json({
        success: false,
        message: '服务器内部错误'
      });
    }
  }

  // 修改密码
  static async changePassword(req: Request, res: Response): Promise<Response | void> {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: '未认证的用户'
        });
      }

      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: '当前密码和新密码都是必填项'
        });
      }

      // 获取用户完整信息（包含密码哈希）
      const user = await UserModel.findById(req.user.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: '用户不存在'
        });
      }

      // 验证当前密码
      const isCurrentPasswordValid = await comparePassword(currentPassword, user.password_hash);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          success: false,
          message: '当前密码错误'
        });
      }

      // 加密新密码
      const hashedNewPassword = await hashPassword(newPassword);

      // 更新密码
      await UserModel.updatePassword(req.user!.id, hashedNewPassword);

      res.json({
        success: true,
        message: '密码修改成功'
      });
    } catch (error) {
      console.error('修改密码错误:', error);
      return res.status(500).json({
        success: false,
        message: '服务器内部错误'
      });
    }
  }
}