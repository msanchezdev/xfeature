# @xfeature/nestjs

A NestJS integration for @xfeature/core that provides decorators for feature-flagging controllers and modules.

## Installation

```bash
bun add @xfeature/nestjs
```

## Quick Start

### 1. Define your features

```typescript
import { defineFeature, registerFeatures } from '@xfeature/core';

export const Features = registerFeatures({
  UserManagement: defineFeature('user-management', {
    Registration: defineFeature('registration'),
    Profile: defineFeature('profile')
  }),
  Analytics: defineFeature('analytics')
});
```

### 2. Use features in your NestJS application

```typescript
import { Controller } from '@nestjs/common';
import { FeatureController } from '@xfeature/nestjs';
import { Features } from './features';

@FeatureController(Features.UserManagement)
export class UserController {
  @Get()
  getUsers() {
    // This controller is only accessible when user-management feature is enabled
    return this.userService.getUsers();
  }
}

@FeatureController(Features.UserManagement.Registration)
export class RegistrationController {
  @Post()
  register(@Body() userData: any) {
    // This controller is only accessible when user-management.registration feature is enabled
    return this.userService.register(userData);
  }
}
```

### 3. Feature-flag entire modules

```typescript
import { Module } from '@nestjs/common';
import { FeatureModule } from '@xfeature/nestjs';
import { Features } from './features';

@FeatureModule(Features.Analytics)
export class AnalyticsModule {
  // This module is only loaded when analytics feature is enabled
}
```

## API Reference

### `@FeatureController(feature, options?)`

Decorator that conditionally applies `@Controller()` based on feature flag state.

```typescript
@FeatureController(Features.UserManagement)
export class UserController {
  // Controller is only registered when user-management feature is enabled
}
```

### `@FeatureModule(feature, options?)`

Decorator that conditionally applies `@Module()` based on feature flag state.

```typescript
@FeatureModule(Features.Analytics)
export class AnalyticsModule {
  // Module is only registered when analytics feature is enabled
}
```

## Best Practices

1. **Organize Features Hierarchically**: Use nested features to group related functionality
   ```typescript
   const Features = {
     Ecommerce: defineFeature('ecommerce', {
       Cart: defineFeature('cart'),
       Payment: defineFeature('payment')
     })
   };
   ```

2. **Use Environment Variables**: Features are automatically loaded from environment variables
   ```bash
   # Enable specific features
   FEATURES="user-management,analytics,user-management.registration"
   ```

3. **Feature Naming**: Use kebab-case for feature names to ensure consistency
   ```typescript
   defineFeature('user-management') // ✅ Good
   defineFeature('userManagement') // ❌ Avoid
   ```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 
