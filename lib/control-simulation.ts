export type ControlParameters = {
  kp: number; ki: number; kd: number; mass: number; voltageLimit: number;
  feedforward: boolean; antiWindup: boolean; delay: boolean;
};
export const defaultControlParameters: ControlParameters = {
  kp: 40, ki: 5, kd: 20, mass: 4, voltageLimit: 12,
  feedforward: true, antiWindup: true, delay: false,
};
export type ControlSample = { time: number; position: number; reference: number; voltage: number; integral: number };

/** Teaching model only: F = 8u - 3v, gravity, floor stop, no motor electrical/thermal model. */
export function simulateElevator(parameters: ControlParameters): ControlSample[] {
  const p = parameters;
  const dt = 0.01, target = 0.6;
  let position = 0, velocity = 0, reference = 0, referenceVelocity = 0, integral = 0;
  const history: { position: number; velocity: number }[] = [];
  const samples: ControlSample[] = [{ time: 0, position: 0, reference: 0, voltage: 0, integral: 0 }];
  const clamp = (value: number, limit: number) => Math.max(-limit, Math.min(limit, value));
  for (let k = 1; k <= 600; k++) {
    // 0.6 m < vmax²/a = 0.64 m: exact triangular profile.
    const time = k * dt, accelerationTime = Math.sqrt(target);
    if (time <= accelerationTime) {
      reference = 0.5 * time * time;
      referenceVelocity = time;
    } else if (time < 2 * accelerationTime) {
      const remainingTime = 2 * accelerationTime - time;
      reference = target - 0.5 * remainingTime * remainingTime;
      referenceVelocity = remainingTime;
    } else {
      reference = target;
      referenceVelocity = 0;
    }
    history.push({ position, velocity });
    const measured = history[Math.max(0, history.length - 1 - (p.delay ? 10 : 0))];
    const error = reference - measured.position;
    const ff = p.feedforward ? 4 * 9.8 / 8 : 0; // nominal 4 kg: changing actual mass exposes model error
    const base = p.kp * error + p.kd * (referenceVelocity - measured.velocity) + ff;
    const candidateIntegral = integral + error * dt;
    const candidateVoltage = base + p.ki * candidateIntegral;
    const pushingIntoSaturation = (candidateVoltage > p.voltageLimit && error > 0) || (candidateVoltage < -p.voltageLimit && error < 0);
    if (!p.antiWindup || !pushingIntoSaturation) integral = candidateIntegral;
    const voltage = clamp(base + p.ki * integral, p.voltageLimit);
    const acceleration = (8 * voltage - 3 * velocity) / p.mass - 9.8;
    velocity += acceleration * dt;
    position += velocity * dt;
    if (position < 0) { position = 0; velocity = Math.max(0, velocity); }
    samples.push({ time: k * dt, position, reference, voltage, integral });
  }
  return samples;
}
