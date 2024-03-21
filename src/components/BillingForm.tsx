'use client'

import { getUserSubscriptionPlan } from '@/lib/stripe'
import { useToast } from './ui/use-toast'
import { trpc } from '@/app/_trpc/client'
import MaxWidthWrapper from './MaxWidthWrapper'
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './ui/card'
import { Button } from './ui/button'
import { Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { useState } from 'react'

interface BillingFormProps {
  subscriptionPlan: Awaited<
    ReturnType<typeof getUserSubscriptionPlan>
  >
}

const BillingForm = ({
  subscriptionPlan,
}: BillingFormProps) => {
  const { toast } = useToast()

  // State variable to track loading state
  const [isMutating, setIsMutating] = useState(false)

  const handleStripeSession = async () => {
    try {
      setIsMutating(true) // Set loading state to true before mutation

      await trpc.createStripeSession.useMutation({
        // ... other options
      })

      // Handle success
    } catch (error) {
      // Handle errors
      console.error('Error creating Stripe session:', error)
      toast({
        title: 'An error occurred',
        description: 'Please try again later',
        variant: 'destructive',
      })
    } finally {
      setIsMutating(false) // Set loading state to false after mutation
    }
  }

  return (
    <MaxWidthWrapper className='max-w-5xl'>
      <form
        className='mt-12'
        onSubmit={(e) => {
          e.preventDefault()
          handleStripeSession()
        }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Subscription Plan</CardTitle>
            <CardDescription>
              You are currently on the{' '}
              <strong>{subscriptionPlan.name}</strong> plan.
            </CardDescription>
          </CardHeader>

          <CardFooter className='flex flex-col items-start space-y-2 md:flex-row md:justify-between md:space-x-0'>
            <Button type='submit' disabled={isMutating}>
              {/* Conditionally render loader based on isMutating */}
              {isMutating ? (
                <Loader2 className='mr-4 h-4 w-4 animate-spin' />
              ) : null}
              {subscriptionPlan.isSubscribed
                ? 'Manage Subscription'
                : 'Upgrade to PRO'}
            </Button>

            {subscriptionPlan.isSubscribed ? (
              <p className='rounded-full text-xs font-medium'>
                {subscriptionPlan.isCanceled
                  ? 'Your plan will be canceled on '
                  : 'Your plan renews on'}
                {format(subscriptionPlan.stripeCurrentPeriodEnd!, 'dd.MM.yyyy')}
                .
              </p>
            ) : null}
          </CardFooter>
        </Card>
      </form>
    </MaxWidthWrapper>
  )
}

export default BillingForm