import { useTRPC } from "@mabigg/data-access";
import { Button } from "@mabigg/ui/components/button";
import { useSuspenseQuery } from "@tanstack/react-query";

export function DiscordSignin() {
  const trpc = useTRPC();
  const providers = useSuspenseQuery(
    trpc.auth.providers.queryOptions(undefined)
  );
  const csrfToken = useSuspenseQuery(
    trpc.auth.csrfToken.queryOptions(undefined)
  );
  const { discord } = providers.data;
  return (
    <form action={discord.signinUrl} method="POST">
      <input type="hidden" name="csrfToken" value={csrfToken.data} />
      <Button type="submit" size="sm">
        Sign in with Discord
      </Button>
    </form>
  );
}
