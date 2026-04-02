"use client";
import { signIn } from "next-auth/react";
import css from "./AuthForm.module.css";

function AuthForm() {
  return (
    <>
      <div className={css.authWrapper}>
        <h1>Please Sign In</h1>
        <button
          type="button"
          className={css.authButton}
          onClick={() => signIn("google", { callbackUrl: "/" })}
        >
          Sign In with Google
        </button>
      </div>
    </>
  );
}

export default AuthForm;
