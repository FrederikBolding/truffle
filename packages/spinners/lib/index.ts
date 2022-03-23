import Spinnies, { SpinnerOptions, StopAllStatus } from "spinnies";

const spinnies = new Spinnies();

/**
 * Add a new spinner with the given name.
 */
export function add(
  name: string,
  options: SpinnerOptions | string
): SpinnerOptions {
  if (typeof options === "string") {
    options = {
      text: options
    };
  }
  return spinnies.add(name, options);
}

/**
 * Get spinner by name;
 */
export function pick(name: string): SpinnerOptions {
  return spinnies.pick(name);
}

/**
 * Remove spinner with name.
 */
export function remove(name: string): SpinnerOptions {
  return spinnies.remove(name);
}

/**
 * Stop spinner with name.
 */
export function stop(name: string) {
  const config = spinnies.pick(name);
  if (config) {
    spinnies.update(name, {
      ...config,
      status: "stopped"
    });
  }
}

/**
 * Updates the spinner with name name with the provided options.
 */
export function update(name: string, options?: SpinnerOptions): SpinnerOptions {
  return spinnies.update(name, options);
}

/**
 * Updates the text of the spinner with the given name
 */
export function updateText(name: string, text: string): SpinnerOptions {
  const config = pick(name);
  return spinnies.update(name, {
    ...config,
    text
  });
}

/**
 * Sets the specified spinner status as succeed.
 */
export function succeed(
  name: string,
  options?: SpinnerOptions
): SpinnerOptions {
  return spinnies.succeed(name, options);
}

/**
 * Sets the specified spinner status as fail.
 */
export function fail(name: string, options?: SpinnerOptions): SpinnerOptions {
  return spinnies.fail(name, options);
}

/**
 * Stops the spinners and sets the non-succeeded and non-failed ones to the provided status.
 */
export function stopAll(status?: StopAllStatus): {
  [name: string]: SpinnerOptions;
} {
  return spinnies.stopAll(status);
}

/**
 * @returns false if all spinners have succeeded, failed or have been stopped
 */
export function hasActiveSpinners(): boolean {
  return spinnies.hasActiveSpinners();
}
