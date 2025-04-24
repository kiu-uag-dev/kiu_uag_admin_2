'use client';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import useSignIn from './useSignIn';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { BUTTON_MESSAGES } from '@/config/constants';

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'form'>) {
  const { onSubmit, form, loading } = useSignIn();

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('flex flex-col gap-6', className)}
        {...props}
      >
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="font text-2xl font-bold">შესვლა</h1>
          <p className="text-balance text-sm text-muted-foreground">
            შეიყვანეთ თქვენი მონაცემები
          </p>
        </div>
        <div className="grid gap-6">
          <div className="grid gap-2">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font">ელ.ფოსტა</FormLabel>
                  <FormControl>
                    <Input placeholder="ელ.ფოსტა" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid gap-2">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font">პაროლი</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="პაროლი" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button type="submit" className="font w-full">
            {loading ? BUTTON_MESSAGES.loading : BUTTON_MESSAGES.login}
          </Button>
        </div>
        {/* <div className="text-center text-sm">
        Don&apos;t have an account?{" "}
        <a href="#" className="underline underline-offset-4">
          Sign up
        </a>
      </div> */}
      </form>
    </Form>
  );
}
