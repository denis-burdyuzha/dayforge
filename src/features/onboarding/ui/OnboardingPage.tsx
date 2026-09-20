import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import { ProgressBar } from "@/shared/ui/ProgressBar/ui/ProgressBar";

import { onboardingRepository } from "../api/onboardingRepository";
import { type OnboardingFormValues, onboardingSchema, stepFields } from "../model/schema";
import { ClassStep } from "./ClassStep";
import { ConfirmationStep } from "./ConfirmationStep";
import { DirectionsStep } from "./DirectionsStep";
import { IdentityStep } from "./IdentityStep";
import { IntroStep } from "./IntroStep";
import styles from "./OnboardingPage.module.css";

const TOTAL_FORM_STEPS = 3;

const depthVariants = {
  initial: (direction: number) => ({
    opacity: 0,
    scale: direction > 0 ? 1.35 : 0.82,
    z: direction > 0 ? 240 : -240,
  }),
  animate: {
    opacity: 1,
    scale: 1,
    z: 0,
  },
  exit: (direction: number) => ({
    opacity: 0,
    scale: direction > 0 ? 0.82 : 1.35,
    z: direction > 0 ? -240 : 240,
  }),
};

export function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<OnboardingFormValues, object, OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      username: "",
      characterName: "",
      classId: "" as OnboardingFormValues["classId"],
      startingDirections: [],
    },
    mode: "onTouched",
  });

  const goNext = async () => {
    let fieldsToValidate: readonly string[] = [];

    if (step === 1) fieldsToValidate = stepFields.identity;
    if (step === 2) fieldsToValidate = stepFields.character;
    if (step === 3) fieldsToValidate = stepFields.directions;

    if (fieldsToValidate.length > 0) {
      const isValid = await form.trigger(fieldsToValidate as never);
      if (!isValid) return;
    }

    setDirection(1);
    setStep((current) => current + 1);
  };

  const goBack = () => {
    setDirection(-1);
    setStep((current) => Math.max(0, current - 1));
  };

  const handleStart = () => {
    setDirection(1);
    setStep(1);
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const values = form.getValues();
      await onboardingRepository.complete(values);
      navigate("/app", { replace: true });
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Не удалось завершить онбординг. Попробуй ещё раз.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.ambientGlow} />
      <div className={styles.container}>
        {step > 0 && step <= TOTAL_FORM_STEPS && (
          <ProgressBar
            value={step}
            max={TOTAL_FORM_STEPS}
            label={`Шаг ${step} / ${TOTAL_FORM_STEPS}`}
          />
        )}

        <div className={styles.stepWrapper}>
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={depthVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{
                duration: 0.5,
                ease: [0.22, 1, 0.36, 1],
              }}
              className={styles.stepContent}
            >
              {step === 0 && <IntroStep onStart={handleStart} />}
              {step === 1 && <IdentityStep form={form} onNext={goNext} />}
              {step === 2 && <ClassStep form={form} onNext={goNext} onBack={goBack} />}
              {step === 3 && <DirectionsStep form={form} onNext={goNext} onBack={goBack} />}
              {step === 4 && (
                <ConfirmationStep
                  values={form.getValues()}
                  onConfirm={handleComplete}
                  onBack={goBack}
                  isSubmitting={isSubmitting}
                  error={submitError}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
