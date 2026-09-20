import type { UseFormReturn } from "react-hook-form";

import { Button } from "@/shared/ui/Button/ui/Button";
import { Input } from "@/shared/ui/Input/ui/Input";

import type { OnboardingFormValues } from "../model/schema";
import identityStyles from "./IdentityStep.module.css";
import styles from "./StepLayout.module.css";

interface IdentityStepProps {
  form: UseFormReturn<OnboardingFormValues, object, OnboardingFormValues>;
  onNext: () => void;
}

export function IdentityStep({ form, onNext }: IdentityStepProps) {
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <div className={styles.step}>
      <h2 className={styles.title}>CREATE YOUR HERO</h2>

      <div className={identityStyles.heroAvatarWrapper}>
        <div className={identityStyles.heroAvatar}>⚔️</div>
      </div>

      <div className={styles.field}>
        <Input
          {...register("username")}
          label="Как тебя будут звать?"
          placeholder="Денис"
          autoFocus
          {...(errors.username?.message ? { error: errors.username.message } : {})}
        />
      </div>

      <Button size="lg" fullWidth onClick={onNext}>
        Далее
      </Button>
    </div>
  );
}
