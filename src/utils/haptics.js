/**
 * Trigger a subtle haptic vibration on Android Chrome.
 * iOS doesn't support the Vibration API — this is a no-op there.
 * Keep durations short (10-20ms) to feel like a native tap, not a buzz.
 */
export function hapticTap() {
  if (navigator.vibrate) navigator.vibrate(10)
}

export function hapticSuccess() {
  if (navigator.vibrate) navigator.vibrate([10, 40, 10])
}
