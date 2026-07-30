import { describe, expect, test } from "bun:test";
import { applyPreviewSettings } from "./settings";

describe("applyPreviewSettings", () => {
  const dbSettings: Record<string, string> = {
    site_title: "Minh Travel",
    site_description: "Old description",
    theme_color: "#0B0F19",
    contact_email: "contact@minhtravel.vn",
  };

  test("merges valid JSON cookie override onto database values", () => {
    const cookie = JSON.stringify({
      site_title: "Minh Travel v2",
      theme_color: "#FFFFFF",
    });
    const result = applyPreviewSettings(dbSettings, cookie);
    expect(result.site_title).toBe("Minh Travel v2");
    expect(result.theme_color).toBe("#FFFFFF");
    expect(result.site_description).toBe("Old description");
    expect(result.contact_email).toBe("contact@minhtravel.vn");
  });

  test("adds new keys from preview that do not exist in database", () => {
    const cookie = JSON.stringify({
      hero_tagline: "New tagline",
      hero_brands: JSON.stringify([{ name: "Brand X" }]),
    });
    const result = applyPreviewSettings(dbSettings, cookie);
    expect(result.hero_tagline).toBe("New tagline");
    expect(result.hero_brands).toBe('[{"name":"Brand X"}]');
  });

  test("falls back to database values when cookie is undefined", () => {
    const result = applyPreviewSettings(dbSettings, undefined);
    expect(result).toEqual(dbSettings);
  });

  test("falls back to database values when cookie is empty string", () => {
    const result = applyPreviewSettings(dbSettings, "");
    expect(result).toEqual(dbSettings);
  });

  test("falls back to database values when cookie is null", () => {
    const result = applyPreviewSettings(dbSettings, null);
    expect(result).toEqual(dbSettings);
  });

  test("falls back to database values when cookie is not valid JSON", () => {
    const result = applyPreviewSettings(dbSettings, "not-json{{{{");
    expect(result).toEqual(dbSettings);
  });

  test("falls back to database values when cookie is 'undefined' string", () => {
    const result = applyPreviewSettings(dbSettings, "undefined");
    expect(result).toEqual(dbSettings);
  });

  test("returns preview-only values when database is empty", () => {
    const cookie = JSON.stringify({
      site_title: "Brand New Site",
      site_description: "Brand new description",
    });
    const result = applyPreviewSettings({}, cookie);
    expect(result.site_title).toBe("Brand New Site");
    expect(result.site_description).toBe("Brand new description");
    expect(Object.keys(result)).toHaveLength(2);
  });

  test("override with URL-encoded JSON still works after decode", () => {
    const encoded = encodeURIComponent(
      JSON.stringify({ site_title: "Có dấu tiếng Việt" }),
    );
    const result = applyPreviewSettings(dbSettings, encoded);
    expect(result.site_title).toBe("Có dấu tiếng Việt");
  });

  test("handles cookie with special characters in values", () => {
    const cookie = JSON.stringify({
      site_description: "Line 1\nLine 2",
      contact_email: "test+alias@minhtravel.vn",
    });
    const result = applyPreviewSettings(dbSettings, cookie);
    expect(result.site_description).toBe("Line 1\nLine 2");
    expect(result.contact_email).toBe("test+alias@minhtravel.vn");
  });

  test("does not mutate the original database object", () => {
    const original = { ...dbSettings };
    const cookie = JSON.stringify({ site_title: "Mutated" });
    applyPreviewSettings(dbSettings, cookie);
    expect(dbSettings).toEqual(original);
  });
});
