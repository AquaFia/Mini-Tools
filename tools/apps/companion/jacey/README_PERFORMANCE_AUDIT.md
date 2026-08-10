# Performance & Runtime Efficiency Audit

## Changes made

### Portrait rendering
- Repeated requests for the exact same identity/expression/context image no longer
  restart the portrait transition or reassign the image source.
- Rapid expression changes use a transition token so stale delayed portrait
  updates cannot overwrite a newer request.
- Context changes still update the portrait when the resolved contextual image
  actually changes.

### Built-in episode loading
- Episode JSON files listed in `episodes/episode_list.json` are now fetched in
  parallel instead of sequentially.
- Installation still follows manifest order.
- One failed episode file no longer prevents the other built-in episodes from
  loading; the failed file is logged individually.

## Audited without changes
- Music and expression manifests already load once per runtime.
- No `setInterval` loops are used.
- Idle timers are cleared before replacement.
- Toast timers are cleared before replacement.
- Music crossfade timers are tokenized/cancelled.
- Special-module initialization occurs once.
- No localStorage write loop exists in the shell.
- DOM-query micro-optimizations were intentionally avoided where they would not
  produce meaningful performance gains.

## Theme performance
Visual-context theme CSS is outside this runtime audit. A slow Halloween theme can
be optimized independently without changing the companion engine.
