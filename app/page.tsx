import { LoginForm } from '@/components/login/login-form';

export default function Home() {
  return (
    <div className="grid min-h-svh grid-cols-1">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        {/* <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <GalleryVerticalEnd className="size-4" />
            </div>
            Acme Inc.
          </a>
        </div> */}
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
      {/* <div className="bg-secondaryGray relative hidden lg:block">
        <video
          className="absolute left-1/2 top-1/2 w-[37.5rem] -translate-x-1/2 -translate-y-1/2 transform"
          autoPlay
          muted
          loop
          width="100%"
          id="bgvid"
        >
          <source src="https://telecomm1.com/telvideo.mp4" type="video/mp4" />
        </video>
      </div> */}
    </div>
  );
}
