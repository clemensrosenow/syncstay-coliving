import { Suspense } from 'react'

import CheckoutLoading from './CheckoutLoading'

export default function CheckoutPage() {
  return (
    <Suspense>
      <CheckoutLoading />
    </Suspense>
  )
}
