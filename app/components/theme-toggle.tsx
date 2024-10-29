import { Theme, useTheme } from "remix-themes";

import { Button } from "~/components/ui/button";
import ThemeSystem from "./icons/ThemeSystem";

export function ThemeToggle() {
  const [theme, setTheme] = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === Theme.LIGHT ? Theme.DARK : Theme.LIGHT)}
    >
      <ThemeSystem classes={["size-4"]} />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
