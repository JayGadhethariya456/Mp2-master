"use client"

import { getUserSubscriptionPlan } from "@/lib/stripe"
import { useToast } from "./ui/use-toast"
import { trpc } from "@/app/_trpc/client"
import MaxWidthWrapper from "./MaxWidthWrapper"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Loader2 } from "lucide-react"
import { format } from "date-fns"
import { useState } from 'react';

interface BillingFormProps {
    subscriptionPlan: Awaited<
      ReturnType<typeof getUserSubscriptionPlan>
    >
  }

  type StatusType = 'success' | 'error' | 'idle' | 'pending' | 'loading';

  const BillingForm = ({ subscriptionPlan }: BillingFormProps) => {
    const { toast } = useToast();

    // Use status from the mutation hook
    const { mutate: createStripeSession, status: StatusType } = trpc.createStripeSession.useMutation({
        onSuccess: ({ url }) => {
            if (url) window.location.href = url;
            if (!url) {
                toast({
                    title: 'There was a problem...',
                    description: 'Please try again in a moment',
                    variant: 'destructive',
                });
            }
        },
    });

    // Check if the mutation is currently loading
    const isLoading = status === 'loading';

    return (
        <MaxWidthWrapper>
            <form
                className='mt-12'
                onSubmit={(e) => {
                    e.preventDefault();
                    createStripeSession();
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
                            {isLoading ? <Loader2 /> : (subscriptionPlan.isSubscribed
                                ? 'Manage Subscription'
                                : 'Upgrade to PRO')}
                        </Button>

                        {subscriptionPlan.isSubscribed && (
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
                        )}
                    </CardFooter>
                </Card>
            </form>
        </MaxWidthWrapper>
    );
}

export default BillingForm;

