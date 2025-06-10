const symFeatureName = Symbol("feature name");
const symFeatureLeafName = Symbol("feature leaf name");
const symFeatureEnabled = Symbol("feature enabled");
const symFeatureDisableFlag = Symbol("feature disable flag");

/**
 * A feature's name
 */
export type FeatureName = string;

/**
 * A feature's object definition, mainly used to allow recursion
 */
export type FeatureObject = {
	[symFeatureName]: FeatureName;
	[symFeatureLeafName]: FeatureName;
	[symFeatureEnabled]?: boolean;
	[symFeatureDisableFlag]: false;
};

export type FeatureObjectWithMethods = FeatureObject & {
	$name(): FeatureName;
	$asDisabled(): Omit<FeatureObject, typeof symFeatureDisableFlag> & {
		$name(): FeatureName;
		[symFeatureDisableFlag]: true;
	};
	$enable(): void;
	$disable(): void;
	$isEnabled(): boolean;
	$isDisabled(): boolean;
};

/**
 * The registry containing all features in the application.
 * This is a singleton and features should be registered only once before
 * the app runs.
 *
 * @internal
 */
const featureRegistry = new Map<string, FeatureObjectWithMethods>();

/**
 * Update the feature registry.
 *
 * @param features - A map of features to be registered.
 * @param override - Whether to override existing features.
 */
export const registerFeatures = <
	T extends Record<string, FeatureObjectWithMethods>,
>(
	features: T,
	options: {
		/**
		 * If false, the feature registry will not be cleared before registering the features.
		 * Useful to add new features to an existing registry.
		 */
		override?: boolean;
		/**
		 * If false, the features will not be loaded from environment variables.
		 * Features can be loaded manually by:
		 * - Using `loadFeaturesFromString` with a comma-separated feature string
		 * - Using `loadFeatures` with an array of feature names
		 * - Getting existing features with `getFeature`
		 * - Creating new features with `defineFeature`
		 *
		 * If a string is provided, the features will be loaded from the environment variable with the given name.
		 * e.g.: `parseEnv: "APP_FEATURES"` will load the features from the `APP_FEATURES` environment variable.
		 *
		 * @default "FEATURES"
		 */
		parseEnv?: boolean | string;
	} = {},
): T => {
	if (options.override) {
		featureRegistry.clear();
	}

	function register(features: Record<string, FeatureObjectWithMethods>) {
		for (const featureName in features) {
			const feature = features[featureName];
			if (isFeatureObject(feature)) {
				featureRegistry.set(feature[symFeatureName], feature);
				// This type is recursive and I dont want to think about the typing anymore
				// biome-ignore lint/suspicious/noExplicitAny:
				register(feature as any);
			}
		}

		return features;
	}

	const result = register(features);

	if (options.parseEnv ?? true) {
		loadFeaturesFromString(
			typeof options.parseEnv === "string"
				? (process.env[options.parseEnv] ?? "")
				: (process.env.FEATURES ?? ""),
		);
	}

	return result as T;
};

export const loadFeaturesFromString = (features: string) => {
	const featuresToEnable = features
		.split(",")
		.map((feature) => {
			const featureName = feature.trim();
			if (!featureName) {
				return;
			}

			const featureObject = getFeature(featureName);
			if (!featureObject) {
				throw new Error(
					`Feature ${featureName} not found. Available features: ${[...featureRegistry.keys()].join(", ")}`,
				);
			}
			return featureObject;
		})
		.filter(
			(feature): feature is FeatureObjectWithMethods => feature !== undefined,
		);
	loadFeatures(featuresToEnable);
};

export const defineFeature = <T extends Record<string, FeatureObject>>(
	feature: FeatureName,
	subfeatures?: T,
): T & FeatureObjectWithMethods => {
	const featureObject = {
		[symFeatureName]: feature as FeatureName,
		...subfeatures,
	} as T & FeatureObjectWithMethods;

	Object.defineProperty(featureObject, symFeatureLeafName, {
		enumerable: false,
		value: feature,
	});

	Object.defineProperty(featureObject, "$name", {
		enumerable: false,
		value: () => featureObject[symFeatureName],
	});

	Object.defineProperty(featureObject, "$asDisabled", {
		enumerable: false,
		value: () => ({
			[symFeatureDisableFlag]: true,
			[symFeatureName]: featureObject[symFeatureName],
		}),
	});

	Object.defineProperty(featureObject, "$enable", {
		enumerable: false,
		value: () => {
			featureObject[symFeatureEnabled] = true;
		},
	});

	Object.defineProperty(featureObject, "$disable", {
		enumerable: false,
		value: () => {
			featureObject[symFeatureEnabled] = false;
		},
	});

	Object.defineProperty(featureObject, "$isEnabled", {
		enumerable: false,
		value: () => isFeatureEnabled(featureObject),
	});

	Object.defineProperty(featureObject, "$isDisabled", {
		enumerable: false,
		value: () => !isFeatureEnabled(featureObject),
	});

	prefixFeatureName(feature, subfeatures || {});
	return featureObject;
};

/**
 * Prefixes the feature name with the parent feature name.
 * @param feature - The feature name to prefix.
 * @param subfeatures - The subfeatures to prefix.
 * @returns The prefixed subfeatures.
 */
const prefixFeatureName = (
	feature: FeatureName,
	subfeatures: Record<string, FeatureObject>,
) => {
	for (const subfeatureKey in subfeatures) {
		const subfeature = subfeatures[subfeatureKey];
		if (isFeatureObject(subfeature)) {
			const prefixedFeatureName =
				`${feature}.${subfeature[symFeatureLeafName]}` as FeatureName;

			subfeature[symFeatureName] = prefixedFeatureName;
			prefixFeatureName(prefixedFeatureName, subfeature);
		}
	}
	return subfeatures;
};

/**
 * Loads the features from the environment variables or from the provided list.
 * This function
 */
export const loadFeatures = (features: FeatureObject[], override = false) => {
	if (override) {
		for (const feature of featureRegistry.values()) {
			delete feature[symFeatureEnabled];
		}
	}

	for (const feature of features) {
		if (!isFeatureObject(feature)) {
			continue;
		}

		if (feature[symFeatureDisableFlag] !== undefined) {
			const baseFeature = featureRegistry.get(feature[symFeatureName]);
			if (baseFeature) {
				baseFeature[symFeatureEnabled] = false;
			}
		} else {
			feature[symFeatureEnabled] = true;
		}
	}

	// console.log(
	// 	"registry =",
	// 	inspect(
	// 		[...featureRegistry.entries()].map(([key, value]) => ({
	// 			name: key,
	// 			enabled: value.$isEnabled(),
	// 		})),
	// 		{ depth: null, colors: true },
	// 	),
	// );
};

/**
 * Features are enabled according to its name.
 *
 * Features are namespaced by dot notation.
 * A parent feature will enable or disable all its children features.
 * The most specific rule prevails.
 * e.g.:
 * - posts
 * - posts.search
 * - posts.search.ai
 */
export const isFeatureEnabled = (
	feature: FeatureObject & {
		[symFeatureDisableFlag]: false;
	},
) => {
	const featureName = feature[symFeatureName];

	// console.log("checking feature", featureName, "explicitly", feature);
	if (feature[symFeatureEnabled] === undefined) {
		const parents = featureName
			.split(".")
			.map((_, index, parts) => parts.slice(0, index + 1).join("."));

		// console.log("feature", featureName, "will check parents", parents);
		while (parents.length > 0) {
			const parentName = parents.pop();
			if (!parentName) {
				continue;
			}

			const parent = featureRegistry.get(parentName);
			if (!parent) {
				continue;
			}

			// console.log("parent", parentName, "is", parent);
			if (parent[symFeatureEnabled] !== undefined) {
				feature[symFeatureEnabled] = parent[symFeatureEnabled];
				// console.log(
				// 	"feature",
				// 	featureName,
				// 	"inherited from",
				// 	parentName,
				// 	"as",
				// 	parent[symFeatureEnabled],
				// );
				break;
			}
		}

		feature[symFeatureEnabled] ??= true;
	}

	// console.log("feature", featureName, "is", feature[symFeatureEnabled]);
	return feature[symFeatureEnabled] ?? true;
};

export const getFeature = (feature: FeatureName) => {
	if (feature.startsWith("-")) {
		const featureObject = featureRegistry.get(feature.slice(1));
		if (featureObject) {
			return featureObject.$asDisabled();
		}
		return null;
	}

	return featureRegistry.get(feature) || null;
};

const isFeatureObject = (obj: unknown): obj is FeatureObject => {
	return typeof obj === "object" && obj !== null && symFeatureName in obj;
};
