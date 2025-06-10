import {
  Controller,
  type ControllerOptions,
  Module,
  type ModuleMetadata,
  applyDecorators,
} from "@nestjs/common";
import type { FeatureObject } from "@xfeature/core";

export const FeatureModule = (
  feature: FeatureObject,
  options?: ModuleMetadata,
) => applyDecorators(...(feature.$isEnabled() ? [Module(options || {})] : []));

export const FeatureController = (
  feature: FeatureObject,
  options?: ControllerOptions | string | string[],
) =>
  applyDecorators(
    ...(feature.$isEnabled()
      ? [
          Controller(
            // @ts-ignore: We dont care about the actual signature
            options || {},
          ),
        ]
      : []),
  );
