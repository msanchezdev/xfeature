# @xfeature/core

A powerful and flexible feature flag library for JavaScript and TypeScript applications that allows you to control feature rollouts, A/B testing, and feature toggles with ease.

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
```

### 2. Use features in your code

```typescript
import { isFeatureEnabled } from '@xfeature/core';
import { Features } from './features';

if (isFeatureEnabled(Features.UserManagement)) {
  // New user management logic
} else {
  // Fallback to old logic
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
export const Features = registerFeatures({
  UserManagement: defineFeature('user-management'),
  Analytics: defineFeature('analytics'),
  NewUI: defineFeature('new-ui')
}, {
  parseEnv: 'APP_FEATURES'  // Use APP_FEATURES instead of FEATURES
});
```

## API Reference

### `defineFeature(name, subfeatures?)`

Creates a new feature definition.

```typescript
const myFeature = defineFeature('my-feature', {
  subFeature: defineFeature('sub-feature')
});
```

### `registerFeatures(features, options?)`

Registers features in the global registry and automatically loads them from environment variables.

```typescript
registerFeatures(Features, {
  override: true,           // Clear existing features first
  parseEnv: 'APP_FEATURES'  // Load from APP_FEATURES env variable
});
```

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

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 
