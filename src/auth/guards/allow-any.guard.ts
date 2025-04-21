// allow-any.guard.ts
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class AllowAnyGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const allowAny = this.reflector.get<boolean>('allow-any', context.getHandler());
        if (allowAny) {
            return true;  // Skip further authentication
        }
        // Insert authentication logic here, or delegate to other guards
        return false;
    }
}
