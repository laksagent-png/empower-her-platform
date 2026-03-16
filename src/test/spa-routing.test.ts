import { describe, it, expect } from "vitest";

/**
 * Tests for the two-part SPA routing redirect mechanism used to make all
 * routes accessible on GitHub Pages (a static host that returns a real 404
 * for any path that isn't a physical file).
 *
 * Part 1 – 404.html encodes the original path into a query string and
 *           redirects to index.html.
 * Part 2 – index.html decodes that query string back into the original path
 *           via history.replaceState before React Router initialises.
 *
 * These helpers mirror the inline scripts verbatim so that any future change
 * to the scripts can be validated here first.
 */

// ---------------------------------------------------------------------------
// Part 1: encode (mirrors the inline script in public/404.html)
// ---------------------------------------------------------------------------

/**
 * Computes the redirect URL that public/404.html sends the browser to.
 *
 * @param pathname  - `window.location.pathname` at the 404 page
 * @param search    - `window.location.search`   at the 404 page  (e.g. "?foo=bar")
 * @param hash      - `window.location.hash`     at the 404 page  (e.g. "#section")
 * @param pathSegmentsToKeep - number of leading path segments to keep as the
 *   base (1 = keep the repo-name segment "/empower-her-platform")
 */
function encode404Redirect(
  pathname: string,
  search: string,
  hash: string,
  pathSegmentsToKeep = 1
): string {
  const base = pathname.split("/").slice(0, 1 + pathSegmentsToKeep).join("/");
  const rest = pathname
    .slice(1)
    .split("/")
    .slice(pathSegmentsToKeep)
    .join("/")
    .replace(/&/g, "~and~");
  const searchPart = search
    ? "&" + search.slice(1).replace(/&/g, "~and~")
    : "";
  return base + "/?/" + rest + searchPart + hash;
}

// ---------------------------------------------------------------------------
// Part 2: decode (mirrors the inline script in index.html)
// ---------------------------------------------------------------------------

/**
 * Computes the restored path that index.html writes via history.replaceState.
 * Returns null when no encoded path is present (normal page load).
 *
 * @param pathname - `window.location.pathname` when index.html loads
 * @param search   - `window.location.search`   when index.html loads
 * @param hash     - `window.location.hash`     when index.html loads
 */
function decodeIndexRedirect(
  pathname: string,
  search: string,
  hash: string
): string | null {
  if (search[1] !== "/") return null;
  const decoded = search
    .slice(1)
    .split("&")
    .map((s) => s.replace(/~and~/g, "&"))
    .join("?");
  return pathname.replace(/\/$/, "") + decoded + hash;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("404.html → encode redirect URL", () => {
  it("encodes /empower-her-platform/admin", () => {
    expect(
      encode404Redirect("/empower-her-platform/admin", "", "")
    ).toBe("/empower-her-platform/?/admin");
  });

  it("encodes /empower-her-platform/admin/dashboard", () => {
    expect(
      encode404Redirect("/empower-her-platform/admin/dashboard", "", "")
    ).toBe("/empower-her-platform/?/admin/dashboard");
  });

  it("preserves query string parameters", () => {
    expect(
      encode404Redirect("/empower-her-platform/admin", "?redirect=true", "")
    ).toBe("/empower-her-platform/?/admin&redirect=true");
  });

  it("preserves hash fragment", () => {
    expect(
      encode404Redirect("/empower-her-platform/admin", "", "#section")
    ).toBe("/empower-her-platform/?/admin#section");
  });

  it("escapes & in path with ~and~", () => {
    // ampersands in path segments are unusual but the script handles them
    expect(
      encode404Redirect("/empower-her-platform/a&b", "", "")
    ).toBe("/empower-her-platform/?/a~and~b");
  });

  it("encodes root /empower-her-platform/ (no extra segment)", () => {
    expect(
      encode404Redirect("/empower-her-platform/", "", "")
    ).toBe("/empower-her-platform/?/");
  });
});

describe("index.html → decode redirect URL", () => {
  it("decodes /?/admin back to /admin path", () => {
    expect(
      decodeIndexRedirect("/empower-her-platform/", "?/admin", "")
    ).toBe("/empower-her-platform/admin");
  });

  it("decodes /?/admin/dashboard", () => {
    expect(
      decodeIndexRedirect("/empower-her-platform/", "?/admin/dashboard", "")
    ).toBe("/empower-her-platform/admin/dashboard");
  });

  it("restores query string parameters", () => {
    expect(
      decodeIndexRedirect("/empower-her-platform/", "?/admin&redirect=true", "")
    ).toBe("/empower-her-platform/admin?redirect=true");
  });

  it("restores hash fragment", () => {
    expect(
      decodeIndexRedirect("/empower-her-platform/", "?/admin", "#section")
    ).toBe("/empower-her-platform/admin#section");
  });

  it("restores ~and~ back to & in query parameters", () => {
    expect(
      decodeIndexRedirect(
        "/empower-her-platform/",
        "?/admin&a~and~b=1",
        ""
      )
    ).toBe("/empower-her-platform/admin?a&b=1");
  });

  it("returns null for a normal (non-redirect) page load", () => {
    expect(
      decodeIndexRedirect("/empower-her-platform/", "", "")
    ).toBeNull();
  });

  it("returns null when search does not start with /", () => {
    expect(
      decodeIndexRedirect("/empower-her-platform/", "?normal=query", "")
    ).toBeNull();
  });

  it("strips trailing slash from pathname before appending decoded path", () => {
    // pathname with trailing slash must not produce double slash
    const result = decodeIndexRedirect(
      "/empower-her-platform/",
      "?/admin",
      ""
    );
    expect(result).toBe("/empower-her-platform/admin");
    expect(result).not.toContain("//");
  });
});

describe("round-trip: encode then decode", () => {
  const routes = [
    "/empower-her-platform/admin",
    "/empower-her-platform/admin/dashboard",
  ];

  for (const originalPath of routes) {
    it(`restores '${originalPath}' after encode → decode`, () => {
      // Simulate what happens when a user navigates directly to the route:
      // 1. GitHub Pages 404s and serves public/404.html
      const encoded = encode404Redirect(originalPath, "", "");

      // 2. index.html loads at the redirect target; extract its pathname/search
      //    The "?" is the start of search, not part of pathname.
      const questionMark = encoded.indexOf("?");
      const encodedPathname = encoded.slice(0, questionMark); // e.g. "/empower-her-platform/"
      const encodedSearch = encoded.slice(questionMark);      // e.g. "?/admin"

      // 3. The decode script restores the original path
      const restored = decodeIndexRedirect(encodedPathname, encodedSearch, "");

      expect(restored).toBe(originalPath);
    });
  }
});
