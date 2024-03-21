'use client'

import { useState, useEffect } from 'react';
import { getUserSubscriptionPlan } from '@/lib/stripe';
import { useToast } from './ui/use-toast';
import { trpc } from '@/app/_trpc/client';
import MaxWidthWrapper from './MaxWidthWrapper';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Button } from './ui/button';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface BillingFormProps {
  subscriptionPlan: Awaited<
  ReturnType<typeof getUserSubscriptionPlan>
>
}

const BillingForm = (props: BillingFormProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [subscriptionPlan, setSubscriptionPlan] = useState<any>(null);

  useEffect(() => {
    async function fetchSubscriptionPlan() {
      setIsLoading(true);
      try {
        const plan = await getUserSubscriptionPlan();
        setSubscriptionPlan(plan);
      } catch (error) {
        console.error('Error fetching subscription plan:', error);
        toast({
          title: 'Error',
          description: 'An error occurred while fetching your subscription plan. Please try again later.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchSubscriptionPlan();
  }, []);

  const handleMutate = async () => {
    setIsLoading(true);
    try {
      const { mutate: createStripeSessionMutation } =
        trpc.createStripeSession.useMutation();
      await createStripeSessionMutation();
      window.location.href = 'redirect-url';
    } catch (error) {
      console.error('Error creating stripe session:', error);
      toast({
        title: 'Error',
        description: 'An error occurred. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    setIsLoading(true);
    try {
      // Implement cancellation logic here
      toast({
        title: 'Subscription Canceled',
        description: 'Your subscription has been canceled successfully.',
        variant: null,
      });
    } catch (error) {
      console.error('Error canceling subscription:', error);
      toast({
        title: 'Error',
        description: 'An error occurred while canceling your subscription. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MaxWidthWrapper className='max-w-5xl'>
      {subscriptionPlan && (
        <form
          className='mt-12'
          onSubmit={(e) => {
            e.preventDefault();
            handleMutate();
          }}>
          <Card>
            <CardHeader>
              <CardTitle>Subscription Plan</CardTitle>
              <CardDescription>
                You are currently on the{' '}
                <strong>{subscriptionPlan.name}</strong> plan.
              </CardDescription>
            </CardHeader>

            <CardFooter className='flex flex-col items-start space-y-2 md:flex-row md:justify-between md:space-x-0'>
              <Button type='submit' disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className='mr-4 h-4 w-4 animate-spin' />
                ) : null}
                {subscriptionPlan.isSubscribed
                  ? 'Manage Subscription'
                  : 'Upgrade to PRO'}
              </Button>

              {subscriptionPlan.isSubscribed ? (
                <div>
                  <Button onClick={handleCancelSubscription} disabled={isLoading}>
                    {isLoading ? 'Cancelling...' : 'Cancel Subscription'}
                  </Button>
                  <p className='rounded-full text-xs font-medium'>
                    {subscriptionPlan.isCanceled
                      ? 'Your plan will be canceled on '
                      : 'Your plan renews on'}
                    {format(
                      subscriptionPlan.stripeCurrentPeriodEnd!,
                      'dd.MM.yyyy'
                    )}
                    .
                  </p>
                </div>
              ) : null}
            </CardFooter>
          </Card>
        </form>
      )}
    </MaxWidthWrapper>
  );
};

export default BillingForm;


