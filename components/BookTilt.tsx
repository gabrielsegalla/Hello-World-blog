'use client'
import Image from 'next/image'
import { useRef } from 'react'

interface BookTiltProps {
  src: string
  alt: string
  width?: number
  height?: number
}

export default function BookTilt({ src, alt, width = 260, height = 420 }: BookTiltProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const innerRef = useRef<HTMLDivElement | null>(null)
  const glareRef = useRef<HTMLDivElement | null>(null)
  const rafRef = useRef<number | null>(null)

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const node = wrapperRef.current
    const inner = innerRef.current
    const glare = glareRef.current
    if (!node || !inner) return

    const rect = node.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const px = x / rect.width
    const py = y / rect.height

    const maxTilt = 18
    const rotateY = (px - 0.5) * 2 * maxTilt
    const rotateX = -(py - 0.5) * 2 * maxTilt

    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(() => {
      inner.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
      if (glare) {
        glare.style.background = `radial-gradient(circle at ${px * 100}% ${py * 100}%, rgba(255,255,255,.28) 0%, rgba(255,255,255,0) 55%)`
        glare.style.opacity = '1'
      }
    })
  }

  function onMouseLeave() {
    const inner = innerRef.current
    const glare = glareRef.current
    if (inner) inner.style.transform = 'rotateX(0deg) rotateY(0deg)'
    if (glare) glare.style.opacity = '0'
  }

  return (
    <div
      ref={wrapperRef}
      className="book-tilt"
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{ width, height }}
    >
      <div ref={innerRef} className="book-tilt-inner">
        <div className="book-tilt-shine" aria-hidden="true" />
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className="book-tilt-image"
          priority
        />
        <div ref={glareRef} className="book-tilt-glare" aria-hidden="true" />
        <span className="book-tilt-spine" aria-hidden="true" />
        <span className="book-tilt-edge" aria-hidden="true" />
      </div>
      <div className="book-tilt-shadow" aria-hidden="true" />
    </div>
  )
}
