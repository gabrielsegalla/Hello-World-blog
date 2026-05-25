'use client'

import Link from 'next/link'
import type { ComponentProps } from 'react'

type EbookCheckoutLinkProps = ComponentProps<typeof Link>

export default function EbookCheckoutLink({ onClick, ...props }: EbookCheckoutLinkProps) {
  return (
    <Link
      {...props}
      onClick={e => {
        if (typeof window !== 'undefined' && window.fbq) {
          window.fbq('track', 'InitiateCheckout', {
            content_name: 'HelloWorld Ebook',
            value: 27.0,
            currency: 'BRL',
          })
        }
        onClick?.(e)
      }}
    />
  )
}
