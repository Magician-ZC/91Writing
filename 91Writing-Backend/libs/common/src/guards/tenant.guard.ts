import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class TenantGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const tenantId = request.headers['x-tenant-id'] || request.user?.tenantId;
    
    if (!tenantId) {
      // 对于单租户应用，暂时跳过租户验证
      return true;
    }

    request.tenantId = tenantId;
    
    return true;
  }
}
