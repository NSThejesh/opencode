import type { HexColor, OklchColor, ThemeSeedColors } from "./types"
import { hexToOklch, oklchToHex, shift } from "./color"

export type HarmonyType =
  | "complementary"
  | "analogous"
  | "triadic"
  | "monochromatic"
  | "split-complementary"
  | "tetradic"

function hue(degrees: number): number {
  return ((degrees % 360) + 360) % 360
}

function rotateHue(hex: HexColor, degrees: number): HexColor {
  const oklch = hexToOklch(hex)
  return oklchToHex({ ...oklch, h: hue(oklch.h + degrees) })
}

function varyLightness(hex: HexColor, lightnessOffsets: number[]): HexColor[] {
  const oklch = hexToOklch(hex)
  return lightnessOffsets.map((offset) =>
    oklchToHex({
      ...oklch,
      l: Math.max(0.05, Math.min(0.95, oklch.l + offset)),
    }),
  )
}

function getColorRoles(seed: HexColor): {
  primary: HexColor
  success: HexColor
  warning: HexColor
  error: HexColor
  info: HexColor
  interactive: HexColor
  diffAdd: HexColor
  diffDelete: HexColor
} {
  return {
    primary: seed,
    success: rotateHue(seed, 120),
    warning: rotateHue(seed, 80),
    error: rotateHue(seed, -120),
    info: rotateHue(seed, 200),
    interactive: seed,
    diffAdd: rotateHue(seed, 120),
    diffDelete: rotateHue(seed, -120),
  }
}

export function complementary(seed: HexColor): ThemeSeedColors {
  const base = hexToOklch(seed)
  const complement = rotateHue(seed, 180)

  return {
    neutral: varyLightness(seed, [-0.15, 0, 0.15])[1],
    ...getColorRoles(seed),
    success: varyLightness(complement, [0.05, -0.05])[0],
    warning: varyLightness(seed, [-0.08])[0],
    error: varyLightness(complement, [-0.05])[0],
    info: varyLightness(seed, [0.08])[0],
  }
}

export function analogous(seed: HexColor): ThemeSeedColors {
  const colors = [
    rotateHue(seed, -30),
    seed,
    rotateHue(seed, 30),
  ]

  return {
    neutral: colors[1],
    primary: colors[0],
    success: colors[2],
    warning: rotateHue(seed, 60),
    error: rotateHue(seed, -60),
    info: rotateHue(seed, 180),
    interactive: colors[0],
    diffAdd: rotateHue(seed, 150),
    diffDelete: rotateHue(seed, -150),
  }
}

export function triadic(seed: HexColor): ThemeSeedColors {
  const colors = [
    seed,
    rotateHue(seed, 120),
    rotateHue(seed, 240),
  ]

  return {
    neutral: varyLightness(seed, [-0.1])[0],
    primary: colors[0],
    success: colors[1],
    warning: rotateHue(seed, 60),
    error: colors[2],
    info: rotateHue(seed, 180),
    interactive: colors[0],
    diffAdd: colors[1],
    diffDelete: colors[2],
  }
}

export function monochromatic(seed: HexColor): ThemeSeedColors {
  const scale = varyLightness(seed, [-0.25, -0.15, 0, 0.1, 0.2, 0.3])

  return {
    neutral: scale[1],
    primary: scale[2],
    success: scale[3],
    warning: scale[4],
    error: scale[5],
    info: rotateHue(seed, 180),
    interactive: scale[2],
    diffAdd: shift(seed, { l: 0.1, h: 120 }),
    diffDelete: shift(seed, { l: -0.1, h: -120 }),
  }
}

export function splitComplementary(seed: HexColor): ThemeSeedColors {
  const colors = [
    seed,
    rotateHue(seed, 150),
    rotateHue(seed, 210),
  ]

  return {
    neutral: varyLightness(seed, [-0.1])[0],
    primary: colors[0],
    success: colors[1],
    warning: rotateHue(seed, 75),
    error: colors[2],
    info: rotateHue(seed, 180),
    interactive: colors[0],
    diffAdd: colors[1],
    diffDelete: colors[2],
  }
}

export function tetradic(seed: HexColor): ThemeSeedColors {
  const colors = [
    seed,
    rotateHue(seed, 90),
    rotateHue(seed, 180),
    rotateHue(seed, 270),
  ]

  return {
    neutral: varyLightness(colors[0], [-0.1])[0],
    primary: colors[0],
    success: colors[1],
    warning: colors[2],
    error: colors[3],
    info: rotateHue(seed, 45),
    interactive: colors[0],
    diffAdd: colors[1],
    diffDelete: colors[3],
  }
}

export function generatePalette(type: HarmonyType, seedColor: HexColor): ThemeSeedColors {
  switch (type) {
    case "complementary":
      return complementary(seedColor)
    case "analogous":
      return analogous(seedColor)
    case "triadic":
      return triadic(seedColor)
    case "monochromatic":
      return monochromatic(seedColor)
    case "split-complementary":
      return splitComplementary(seedColor)
    case "tetradic":
      return tetradic(seedColor)
    default:
      return complementary(seedColor)
  }
}
