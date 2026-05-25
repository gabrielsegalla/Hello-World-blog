'use client'

import { useEffect } from 'react'

export default function EbookViewContentTracker() {
  useEffect(() => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'ViewContent', {
        content_name: 'HelloWorld Ebook',
        content_category: 'Ebook',
        value: 27.0,
        currency: 'BRL',
      })
    }
  }, [])

  return null
}
