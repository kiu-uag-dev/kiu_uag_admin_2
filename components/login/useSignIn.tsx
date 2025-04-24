import { ERROR_MESSAGES } from '@/config/constants';
import { routes } from '@/config/routes';
import { useToast } from '@/hooks/use-toast';
import { loginSchema, LoginSchema } from '@/schemas/login-schema';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';

const initialValues: LoginSchema = {
  email: '',
  password: '',
};

const useSignIn = () => {
  const [reset, setReset] = useState({});
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: initialValues,
  });

  const onSubmit: SubmitHandler<LoginSchema> = async (data) => {
    try {
      setLoading(true);
      const response = await signIn(
        'credentials',

        {
          redirect: false,
          email: data.email,
          password: data.password,
        }
      );

      if (response?.ok) {
        setLoading(false);
        router.push(routes.dashboard.dashboard);
      }
      if (response?.error) {
        setLoading(false);
        toast({
          title: ERROR_MESSAGES.error,
          description: ERROR_MESSAGES.loginError,
        });
      }
    } catch (error) {
      setLoading(false);
    }
  };

  return {
    reset,
    setReset,
    loading,
    setLoading,
    router,
    onSubmit,
    initialValues,
    loginSchema,
    form,
  };
};

export default useSignIn;
