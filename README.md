# XFeature Core

A powerful and flexible feature flag library for JavaScript and TypeScript applications that allows you to control feature rollouts, A/B testing, and feature toggles with ease.

## Features

- 🚀 **Easy Integration** - Simple setup with any JavaScript/TypeScript application
- 🎯 **Hierarchical Features** - Support for nested feature flags
- 🔄 **Runtime Control** - Enable/disable features at runtime
- 🌍 **Environment-based** - Load features from environment variables
- 📝 **TypeScript Support** - Full TypeScript support with type safety
- 🎛️ **Flexible API** - Intuitive methods for feature management
- 🔧 **Framework Agnostic** - Works with any JavaScript framework or vanilla JS

## Installation

```bash
bun add @xfeature/core
```

## Quick Start

### 1. Define your features

```typescript
import { defineFeature, registerFeatures } from '@xfeature/core';

export const Features = registerFeatures({
  UserManagement: defineFeature('user-management', {
    Registration: defineFeature('registration'),
    Profile: defineFeature('profile', {
      Avatar: defineFeature('avatar'),
      Preferences: defineFeature('preferences')
    })
  }),
  Analytics: defineFeature('analytics'),
  NewUI: defineFeature('new-ui')
});
// Features are automatically loaded from the FEATURES environment variable
```

### 2. Use features in your code

```typescript
import { isFeatureEnabled } from '@xfeature/core';
import { Features } from './features';

class UserService {
  getUsers() {
    if (isFeatureEnabled(Features.UserManagement)) {
      // New user management logic
      return this.getUsersV2();
    }
    
    // Fallback to old logic
    return this.getUsersV1();
  }

  registerUser(userData: any) {
    if (!isFeatureEnabled(Features.UserManagement.Registration)) {
      throw new Error('Registration is currently disabled');
    }
    
    return this.createUser(userData);
  }
}
```

## Environment-based Feature Loading

Features are automatically loaded from environment variables when you register them. By default, the `FEATURES` environment variable is used:

```bash
# Enable specific features
FEATURES="user-management,analytics,user-management.profile.avatar"

# Or in your .env file
FEATURES=user-management,analytics,new-ui
```

### Custom Environment Variable

You can specify a different environment variable:

```typescript
import { defineFeature, registerFeatures } from '@xfeature/core';

// Load features from APP_FEATURES environment variable
export const Features = registerFeatures({
  UserManagement: defineFeature('user-management'),
  Analytics: defineFeature('analytics'),
  NewUI: defineFeature('new-ui')
}, {
  parseEnv: 'APP_FEATURES'  // Use APP_FEATURES instead of FEATURES
});
```

### Manual Feature Loading

If you want to disable automatic environment loading and load features manually:

```typescript
import { registerFeatures, loadFeaturesFromString } from '@xfeature/core';

// Register features without loading from environment
export const Features = registerFeatures({
  UserManagement: defineFeature('user-management'),
  Analytics: defineFeature('analytics'),
  NewUI: defineFeature('new-ui')
}, {
  parseEnv: false  // Disable automatic loading
});

// Load features manually
const featuresEnv = process.env.CUSTOM_FEATURES;
if (featuresEnv) {
  loadFeaturesFromString(featuresEnv);
}
```

## API Reference

### `defineFeature(name, subfeatures?)`

Creates a new feature definition.

```typescript
const myFeature = defineFeature('my-feature', {
  subFeature: defineFeature('sub-feature')
});
```

**Parameters:**
- `name` (string): The feature name
- `subfeatures` (object, optional): Nested sub-features

**Returns:** `FeatureObjectWithMethods`

### `registerFeatures(features, options?)`

Registers features in the global registry and automatically loads them from environment variables.

```typescript
// Basic usage (loads from FEATURES env variable by default)
registerFeatures(Features);

// With custom options
registerFeatures(Features, {
  override: true,           // Clear existing features first
  parseEnv: 'APP_FEATURES'  // Load from APP_FEATURES env variable
});

// Disable automatic environment loading
registerFeatures(Features, {
  parseEnv: false  // Don't load from environment variables
});
```

**Parameters:**
- `features`: Object containing feature definitions
- `options` (object, optional): Configuration options
  - `override` (boolean, default: false): Whether to clear existing features before registering
  - `parseEnv` (boolean | string, default: "FEATURES"): Environment variable to load features from. Set to `false` to disable automatic loading, or provide a custom env variable name

### `loadFeatures(features, override?)`

Loads and enables specific features.

```typescript
loadFeatures([Features.UserManagement, Features.Analytics]);
```

### `loadFeaturesFromString(featuresString)`

Loads features from a comma-separated string.

```typescript
loadFeaturesFromString('user-management,analytics,new-ui');
```

### `isFeatureEnabled(feature)`

Checks if a feature is currently enabled.

```typescript
if (isFeatureEnabled(Features.UserManagement)) {
  // Feature is enabled
}
```

### `getFeature(featureName)`

Retrieves a feature by name from the registry.

```typescript
const feature = getFeature('user-management');
```

## Feature Object Methods

Each feature object comes with built-in methods:

```typescript
const feature = defineFeature('my-feature');

// Get feature name
feature.$name(); // Returns: 'my-feature'

// Enable/disable feature
feature.$enable();
feature.$disable();

// Check status
feature.$isEnabled(); // Returns: boolean
feature.$isDisabled(); // Returns: boolean

// Create disabled version
const disabledFeature = feature.$asDisabled();
```

## Advanced Usage

### Conditional Feature Loading

```typescript
import { registerFeatures, loadFeatures } from '@xfeature/core';

// Option 1: Use different environment variables per environment
if (process.env.NODE_ENV === 'development') {
  registerFeatures(Features, { parseEnv: 'DEV_FEATURES' });
} else if (process.env.NODE_ENV === 'production') {
  registerFeatures(Features, { parseEnv: 'PROD_FEATURES' });
}

// Option 2: Register without auto-loading, then manually load based on environment
registerFeatures(Features, { parseEnv: false });

if (process.env.NODE_ENV === 'development') {
  loadFeatures([
    Features.UserManagement,
    Features.Analytics,
    Features.NewUI
  ]);
} else if (process.env.NODE_ENV === 'production') {
  loadFeatures([
    Features.UserManagement,
    Features.Analytics
  ]);
}
```

### Framework Integration Examples

#### Express.js

```typescript
import express from 'express';
import { isFeatureEnabled } from '@xfeature/core';
import { Features } from './features';

const app = express();

// Middleware to check feature flags
const requireFeature = (feature: any) => {
  return (req: any, res: any, next: any) => {
    if (!isFeatureEnabled(feature)) {
      return res.status(403).json({ error: 'Feature not available' });
    }
    next();
  };
};

// Protected route
app.get('/api/users', requireFeature(Features.UserManagement), (req, res) => {
  // This endpoint is only accessible when user-management feature is enabled
  res.json({ users: [] });
});
```

#### React

```typescript
import React from 'react';
import { isFeatureEnabled } from '@xfeature/core';
import { Features } from './features';

function App() {
  return (
    <div>
      {isFeatureEnabled(Features.NewUI) ? (
        <NewDashboard />
      ) : (
        <LegacyDashboard />
      )}
      
      {isFeatureEnabled(Features.Analytics) && (
        <AnalyticsWidget />
      )}
    </div>
  );
}
```

#### Vue.js

```typescript
import { defineComponent } from 'vue';
import { isFeatureEnabled } from '@xfeature/core';
import { Features } from './features';

export default defineComponent({
  computed: {
    showNewUI() {
      return isFeatureEnabled(Features.NewUI);
    },
    showAnalytics() {
      return isFeatureEnabled(Features.Analytics);
    }
  },
  template: `
    <div>
      <NewDashboard v-if="showNewUI" />
      <LegacyDashboard v-else />
      
      <AnalyticsWidget v-if="showAnalytics" />
    </div>
  `
});
```

### Feature Utilities

Create utility functions for common patterns:

```typescript
import { isFeatureEnabled } from '@xfeature/core';

// Conditional execution
export function withFeature<T>(feature: any, callback: () => T, fallback?: () => T): T | undefined {
  if (isFeatureEnabled(feature)) {
    return callback();
  }
  return fallback ? fallback() : undefined;
}

// Feature-based configuration
export function getConfig(baseConfig: any, featureConfigs: Record<string, any>) {
  let config = { ...baseConfig };
  
  for (const [featureName, featureConfig] of Object.entries(featureConfigs)) {
    const feature = getFeature(featureName);
    if (feature && isFeatureEnabled(feature)) {
      config = { ...config, ...featureConfig };
    }
  }
  
  return config;
}

// Usage
const config = getConfig(
  { apiUrl: '/api/v1' },
  {
    'new-api': { apiUrl: '/api/v2' },
    'debug-mode': { debug: true }
  }
);
```

## Best Practices

1. **Organize Features Hierarchically**: Use nested features to group related functionality
   ```typescript
   const Features = {
     Ecommerce: defineFeature('ecommerce', {
       Cart: defineFeature('cart'),
       Payment: defineFeature('payment', {
         CreditCard: defineFeature('credit-card'),
         Paypal: defineFeature('paypal')
       })
     })
   };
   ```

2. **Use Environment Variables**: Features are automatically loaded from environment variables. Use different variables for different environments
   ```typescript
   // Development
   registerFeatures(Features, { parseEnv: 'DEV_FEATURES' });
   
   // Production  
   registerFeatures(Features, { parseEnv: 'PROD_FEATURES' });
   
   // Or use the default FEATURES variable
   registerFeatures(Features); // Loads from FEATURES env var
   ```

3. **Feature Naming**: Use kebab-case for feature names to ensure consistency
   ```typescript
   defineFeature('user-management') // ✅ Good
   defineFeature('userManagement') // ❌ Avoid
   ```

4. **Graceful Fallbacks**: Always provide fallback behavior when features are disabled
   ```typescript
   if (isFeatureEnabled(Features.NewDashboard)) {
     return this.renderNewDashboard();
   }
   return this.renderLegacyDashboard(); // Fallback
   ```

5. **Performance Considerations**: Cache feature checks in performance-critical code
   ```typescript
   class PerformanceService {
     private featureEnabled = isFeatureEnabled(Features.NewAlgorithm);
     
     processData(data: any[]) {
       if (this.featureEnabled) {
         return this.processWithNewAlgorithm(data);
       }
       return this.processWithLegacyAlgorithm(data);
     }
   }
   ```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the UNLICENSED License - see the package.json file for details.

## Support

If you have any questions or run into issues, please open an issue on [GitHub](https://github.com/msanchezdev/xfeature/issues).
