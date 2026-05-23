# Security Policy

## Supported Versions

The project is currently maintained on the latest release branch.

## Known Dependency Risk: AngularJS 1.x

Firebot currently depends on AngularJS 1.x (`angular` and `angular-sanitize`) in the renderer UI stack.
AngularJS is end-of-life and no patched npm release exists beyond `1.8.3`.

As a result, the following Dependabot alerts remain open and are not fully fixable by npm version bump:

- #11 Angular (deprecated package) Cross-site Scripting
- #18 angular vulnerable to super-linear runtime due to backtracking
- #9 angular vulnerable to regular expression denial of service (ReDoS)
- #14 angular vulnerable to regular expression denial of service via the `<input type="url">` element
- #16 angular vulnerable to regular expression denial of service via the `angular.copy()` utility
- #15 angular vulnerable to regular expression denial of service via the `$resource` service
- #26 AngularJS Incomplete Filtering of Special Elements vulnerability (`angular-sanitize`)
- #25 AngularJS improperly sanitizes SVG elements
- #20 AngularJS allows attackers to bypass common image source restrictions
- #19 AngularJS allows attackers to bypass common image source restrictions

## Current Mitigations

- User-facing HTML rendering paths are sanitized with DOMPurify before trusted rendering in key flows (notifications, update notes, and effect comments).
- Third-party dependency versions are pinned and monitored via lockfile updates and periodic `npm audit --omit=dev` checks.
- Legacy transitive Angular versions are overridden to `1.8.3` to avoid older vulnerable ranges where possible.

## Long-term Remediation

The durable fix is migration away from AngularJS 1.x.

Planned direction:

1. Incrementally replace AngularJS renderer modules with a maintained UI framework.
2. Remove direct dependencies on `angular` and `angular-sanitize`.
3. Close the related advisory set once AngularJS is fully removed.

## Reporting Security Issues

Please report security concerns through the repository support and maintainer channels listed in `.github/SUPPORT.md`.
