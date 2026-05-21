type PublicEnv = {
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: string;
};

type ServerEnv = PublicEnv & {
  SUPABASE_SECRET_KEY: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  APP_BASE_URL: string;
  GOOGLE_REDIRECT_URI: string;
};

function required(name: keyof ServerEnv, value: string | undefined): string {
  if (!value) {
    throw new Error(`${name} が設定されていません。`);
  }

  return value;
}

function firstDefined(name: keyof ServerEnv, ...values: Array<string | undefined>): string {
  return required(
    name,
    values.find((value) => Boolean(value))
  );
}

export const env: PublicEnv = {
  NEXT_PUBLIC_SUPABASE_URL: required(
    "NEXT_PUBLIC_SUPABASE_URL",
    process.env.NEXT_PUBLIC_SUPABASE_URL
  ),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: firstDefined(
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
};

export function serverEnv(): ServerEnv {
  return {
    ...env,
    SUPABASE_SECRET_KEY: firstDefined(
      "SUPABASE_SECRET_KEY",
      process.env.SUPABASE_SECRET_KEY,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    ),
    GOOGLE_CLIENT_ID: required("GOOGLE_CLIENT_ID", process.env.GOOGLE_CLIENT_ID),
    GOOGLE_CLIENT_SECRET: required("GOOGLE_CLIENT_SECRET", process.env.GOOGLE_CLIENT_SECRET),
    APP_BASE_URL: required("APP_BASE_URL", process.env.APP_BASE_URL),
    GOOGLE_REDIRECT_URI: required("GOOGLE_REDIRECT_URI", process.env.GOOGLE_REDIRECT_URI)
  };
}
