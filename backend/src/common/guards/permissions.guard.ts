import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '../../database/models/user.model';
import { Role } from '../../database/models/role.model';
import { Permission } from '../../database/models/permission.model';

export const PERMISSIONS_KEY = 'permissions';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectModel(User)
    private userModel: typeof User,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user || !user.userId) {
      return false;
    }

    // Fetch user with roles and permissions
    const fullUser = await this.userModel.findByPk(user.userId, {
      include: [
        {
          model: Role,
          include: [Permission],
        },
      ],
    });

    if (!fullUser || !fullUser.roles) {
      return false;
    }

    // Get all permissions from all user roles
    const userPermissions: string[] = [];
    fullUser.roles.forEach((role) => {
      if (role.permissions) {
        role.permissions.forEach((permission) => {
          userPermissions.push(permission.name);
        });
      }
    });

    // Check if user has at least one of the required permissions
    return requiredPermissions.some((permission) =>
      userPermissions.includes(permission),
    );
  }
}
