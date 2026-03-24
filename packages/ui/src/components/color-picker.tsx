import { createEffect, createSignal, onMount } from "solid-js"
import type { HexColor, OklchColor } from "../theme/types"
import { hexToOklch, oklchToHex } from "../theme/color"

export { hexToOklch, oklchToHex }

export interface ColorPickerProps {
  initialColor?: HexColor
  onChange?: (value: { hex: HexColor; oklch: OklchColor }) => void
  class?: string
}

interface SliderProps {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (value: number) => void
  formatValue?: (v: number) => string
}

function Slider(props: SliderProps) {
  const displayValue = () => (props.formatValue ? props.formatValue(props.value) : props.value.toFixed(3))

  return (
    <div class="color-picker__slider">
      <div class="color-picker__slider-header">
        <span class="color-picker__slider-label">{props.label}</span>
        <span class="color-picker__slider-value">{displayValue()}</span>
      </div>
      <input
        type="range"
        class="color-picker__range"
        min={props.min}
        max={props.max}
        step={props.step}
        value={props.value}
        onInput={(e) => props.onChange(parseFloat(e.currentTarget.value))}
      />
    </div>
  )
}

export function ColorPicker(props: ColorPickerProps) {
  const defaultColor: OklchColor = { l: 0.5, c: 0.1, h: 240 }

  const [oklch, setOklch] = createSignal<OklchColor>(defaultColor)
  const [hex, setHex] = createSignal<HexColor>("#5c5c8a")

  onMount(() => {
    if (props.initialColor) {
      const converted = hexToOklch(props.initialColor)
      setOklch(converted)
      setHex(props.initialColor)
    }
  })

  createEffect(() => {
    const current = oklch()
    const newHex = oklchToHex(current)
    setHex(newHex)
    props.onChange?.({ hex: newHex, oklch: current })
  })

  const updateOklch = (key: keyof OklchColor, value: number) => {
    setOklch((prev) => ({ ...prev, [key]: value }))
  }

  const hueGradient = () => {
    const c = oklch().c
    const l = oklch().l
    const stops: string[] = []
    for (let h = 0; h <= 360; h += 30) {
      stops.push(oklchToHex({ l, c, h }) + " " + (h / 360) * 100 + "%")
    }
    return `linear-gradient(to right, ${stops.join(", ")})`
  }

  const lightnessGradient = () => {
    const c = oklch().c
    const h = oklch().h
    return `linear-gradient(to right, ${oklchToHex({ l: 0, c, h })}, ${oklchToHex({ l: 0.5, c, h })}, ${oklchToHex({ l: 1, c, h })})`
  }

  const chromaGradient = () => {
    const l = oklch().l
    const h = oklch().h
    const stops: string[] = []
    for (let c = 0; c <= 0.4; c += 0.05) {
      stops.push(oklchToHex({ l, c, h }) + " " + (c / 0.4) * 100 + "%")
    }
    return `linear-gradient(to right, ${stops.join(", ")})`
  }

  return (
    <div class="color-picker" data-component="color-picker">
      <div class="color-picker__preview">
        <div
          class="color-picker__swatch color-picker__swatch--light"
          style={{ "background-color": hex() }}
        />
        <div
          class="color-picker__swatch color-picker__swatch--dark"
          style={{ "background-color": hex() }}
        />
        <div class="color-picker__hex-output">{hex()}</div>
      </div>

      <div class="color-picker__sliders">
        <Slider
          label="L (Lightness)"
          value={oklch().l}
          min={0}
          max={1}
          step={0.001}
          onChange={(v) => updateOklch("l", v)}
          formatValue={(v) => v.toFixed(3)}
        />

        <div class="color-picker__slider-track" style={{ background: lightnessGradient() }}>
          <Slider
            label="C (Chroma)"
            value={oklch().c}
            min={0}
            max={0.4}
            step={0.001}
            onChange={(v) => updateOklch("c", v)}
            formatValue={(v) => v.toFixed(3)}
          />
        </div>

        <div class="color-picker__slider-track" style={{ background: hueGradient() }}>
          <Slider
            label="H (Hue)"
            value={oklch().h}
            min={0}
            max={360}
            step={1}
            onChange={(v) => updateOklch("h", v)}
            formatValue={(v) => v.toFixed(0) + "°"}
          />
        </div>
      </div>

      <div class="color-picker__values">
        <div class="color-picker__value-row">
          <span class="color-picker__value-label">L:</span>
          <span class="color-picker__value-number">{oklch().l.toFixed(4)}</span>
        </div>
        <div class="color-picker__value-row">
          <span class="color-picker__value-label">C:</span>
          <span class="color-picker__value-number">{oklch().c.toFixed(4)}</span>
        </div>
        <div class="color-picker__value-row">
          <span class="color-picker__value-label">H:</span>
          <span class="color-picker__value-number">{oklch().h.toFixed(2)}°</span>
        </div>
      </div>
    </div>
  )
}
