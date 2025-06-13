import { beforeEach, describe, expect, test } from "bun:test";
import { defineFeature } from ".";
import { registerFeatures } from ".";

const makeTestFeatures = (features = "") => {
  process.env.FEATURES = features;
  return registerFeatures({
    One: defineFeature("one", {
      One: defineFeature("one"),
    }),
    Two: defineFeature("two", {
      One: defineFeature("one"),
      Two: defineFeature("two", {
        One: defineFeature("one"),
        Two: defineFeature("two"),
        Three: defineFeature("three"),
      }),
    }),
  });
};

let Feature: ReturnType<typeof makeTestFeatures>;

describe("Feature registry", () => {
  beforeEach(() => {
    Feature = makeTestFeatures();
  });

  test("Features start enabled by default", () => {
    expect(Feature.One.$isEnabled()).toBe(true);
    expect(Feature.Two.$isEnabled()).toBe(true);
    expect(Feature.One.One.$isEnabled()).toBe(true);
    expect(Feature.Two.One.$isEnabled()).toBe(true);
    expect(Feature.Two.Two.$isEnabled()).toBe(true);
  });

  test("Features can be disabled", () => {
    Feature.One.$disable();
    expect(Feature.One.$isEnabled()).toBe(false);
    expect(Feature.Two.$isEnabled()).toBe(true);
  });

  test("Children inherit the parent's state", () => {
    Feature.One.$disable();
    expect(Feature.One.One.$isEnabled()).toBe(false);
    expect(Feature.Two.One.$isEnabled()).toBe(true);
    expect(Feature.Two.Two.$isEnabled()).toBe(true);

    Feature.Two.$disable();
    expect(Feature.One.One.$isEnabled()).toBe(false);
    expect(Feature.Two.One.$isEnabled()).toBe(false);
    expect(Feature.Two.Two.$isEnabled()).toBe(false);
  });

  test("Children can be enabled regardless of the parent's state", () => {
    Feature.Two.$disable();
    expect(Feature.Two.One.$isEnabled()).toBe(false);
    expect(Feature.Two.Two.$isEnabled()).toBe(false);

    Feature.Two.One.$enable();
    expect(Feature.Two.One.$isEnabled()).toBe(true);
    expect(Feature.Two.Two.$isEnabled()).toBe(false);
    expect(Feature.Two.Two.One.$isEnabled()).toBe(false);
    expect(Feature.Two.Two.Two.$isEnabled()).toBe(false);
    expect(Feature.Two.Two.Three.$isEnabled()).toBe(false);

    Feature.Two.Two.$enable();
    expect(Feature.Two.Two.$isEnabled()).toBe(true);
    expect(Feature.Two.Two.One.$isEnabled()).toBe(true);
    expect(Feature.Two.Two.Two.$isEnabled()).toBe(true);
    expect(Feature.Two.Two.Three.$isEnabled()).toBe(true);

    Feature.Two.Two.One.$disable();
    Feature.Two.Two.Three.$disable();
    expect(Feature.Two.Two.$isEnabled()).toBe(true);
    expect(Feature.Two.Two.One.$isEnabled()).toBe(false);
    expect(Feature.Two.Two.Two.$isEnabled()).toBe(true);
    expect(Feature.Two.Two.Three.$isEnabled()).toBe(false);
  });

  describe("Environment Variables", () => {
    test("All features are enabled by default", () => {
      const Feature = makeTestFeatures("");
      expect(Feature.One.$isEnabled()).toBe(true);
      expect(Feature.Two.$isEnabled()).toBe(true);
    });

    test("Features can be disabled by prefixing with a dash", () => {
      const Feature = makeTestFeatures("-one,-two");
      expect(Feature.One.$isEnabled()).toBe(false);
      expect(Feature.Two.$isEnabled()).toBe(false);
    });

    test("All features can be disabled with '-*'", () => {
      const Feature = makeTestFeatures("-*");
      expect(Feature.One.$isEnabled()).toBe(false);
      expect(Feature.Two.$isEnabled()).toBe(false);
    });

    test('Disabling all features, but enabling selected features with "+"', () => {
      const Feature = makeTestFeatures("-*,two.two");
      expect(Feature.One.$isEnabled()).toBe(false);
      expect(Feature.Two.$isEnabled()).toBe(false);
      expect(Feature.Two.One.$isEnabled()).toBe(false);
      expect(Feature.Two.Two.$isEnabled()).toBe(true);
      expect(Feature.Two.Two.One.$isEnabled()).toBe(true);
      expect(Feature.Two.Two.Two.$isEnabled()).toBe(true);
      expect(Feature.Two.Two.Three.$isEnabled()).toBe(true);
    });
  });
});
