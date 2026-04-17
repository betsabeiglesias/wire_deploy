import React, { useEffect, useRef } from "react"
import Gauge from "svg-gauge"
import "../../../../../styles/SvgGauge.css"

export default function SvgGauge({ options, value, className = "", width, height }) {
  const ref = useRef(null)
  const inst = useRef(null)

  useEffect(() => {
    if (ref.current) ref.current.innerHTML = ""
    if (ref.current && !inst.current) {
      const finalOptions = { showValue: true, ...options }
      inst.current = Gauge(ref.current, finalOptions)
      inst.current.setValue(value ?? options?.value ?? 0)
    }
    return () => {
      inst.current = null
      if (ref.current) ref.current.innerHTML = ""
    }
  }, [])

  useEffect(() => {
    if (inst.current) inst.current.setValueAnimated(value, 1)
  }, [value])

  return (
    <div
      className={`gauge-container ${className}`}
      style={{
        width: width ?? "100%",
        height: height ?? "100%",
        background: "transparent",
      }}
    >
      <div ref={ref} className="gauge" />
    </div>
  )
}