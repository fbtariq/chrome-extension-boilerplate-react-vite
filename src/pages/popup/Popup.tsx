import { Button } from "@chakra-ui/react";
import { signInWithGoogle } from "./index";

export default function Popup() {
  return (
    <div>
      <Button onClick={signInWithGoogle}>Sign in with Google</Button>
    </div>
  );
}
