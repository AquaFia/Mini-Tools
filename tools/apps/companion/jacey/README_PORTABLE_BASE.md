# Jacey-Base Companion — Portable Base Certification

## Status

**v7.0 Portable-Base Certification: PASS**

This package contains the certified reusable Jacey-base source files after the
character extraction, special-module extraction, generic-runtime cleanup,
expression-hardcoding cleanup, and duplicate-character acceptance test.

## Certified source ownership

- `companion.html` — generic companion shell/runtime.
- `character.js` — Jacey/Jace, Mao, and Naoya character/identity configuration.
- `special_module.js` — Cipher Lab only.

Existing external folders such as `audio/`, `expressions/`, `episodes/`,
`shared/`, and `themes/` remain separate and are not duplicated in this
updated-files package.

## Certification checks

- Generic shell contains no literal Jacey/Jace/Mao/Naoya names.
- Generic shell contains no Cipher Lab implementation.
- Generic shell contains no Jacey expression-name assumptions.
- Generic shell contains no literal active-identity ID comparisons.
- Normal message-bank routing uses the active identity.
- Redundant `missingBankFallbackExpressions` configuration is absent.
- Cipher Lab has no direct dependency on Episode, music, portrait,
  message-bank, storage, or old Cipher framework internals.
- No orphaned named functions or declared variables were found by the final
  static caller scan.
- `character.js`, `special_module.js`, and all inline JavaScript syntax checks pass.
- Duplicate-character acceptance testing passed after correcting the
  active-identity message-bank selector.
- The minimal test companion successfully exercised the remaining features
  documented in its test README.

## Source-note policy

Refactor/version milestone notes were removed from the source files. Release
versioning is intended to live in the ZIP/package name and documentation rather
than character/runtime source comments.

`Framework.version` is retained as generic runtime metadata with the value
`portable-base` so diagnostics can continue to read the field without tying the
runtime to a refactor build number.
