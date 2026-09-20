import { useState } from "react";
import type { UseFormReturn } from "react-hook-form";

import { characterClasses } from "@/entities/character/model/classes";
import { Button } from "@/shared/ui/Button/ui/Button";
import { Card } from "@/shared/ui/Card/ui/Card";
import { Input } from "@/shared/ui/Input/ui/Input";

import type { OnboardingFormValues } from "../model/schema";
import classStyles from "./ClassStep.module.css";
import styles from "./StepLayout.module.css";

interface ClassStepProps {
  form: UseFormReturn<OnboardingFormValues, object, OnboardingFormValues>;
  onNext: () => void;
  onBack: () => void;
}

export function ClassStep({ form, onNext, onBack }: ClassStepProps) {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = form;

  const selectedClassId = watch("classId");
  const initialIndex = Math.max(
    0,
    characterClasses.findIndex((c) => c.id === selectedClassId),
  );

  const [currentIndex, setCurrentIndex] = useState(initialIndex >= 0 ? initialIndex : 0);

  const currentClass = (characterClasses[currentIndex] ?? characterClasses[0])!;

  const handlePrev = () => {
    const nextIdx = (currentIndex - 1 + characterClasses.length) % characterClasses.length;
    setCurrentIndex(nextIdx);
  };

  const handleNextClass = () => {
    const nextIdx = (currentIndex + 1) % characterClasses.length;
    setCurrentIndex(nextIdx);
  };

  const handleSelect = () => {
    if (currentClass) {
      setValue("classId", currentClass.id, { shouldValidate: true });
    }
    onNext();
  };

  return (
    <div className={styles.step}>
      <h2 className={styles.title}>CHOOSE YOUR PATH</h2>

      <div className={styles.field}>
        <Input
          {...register("characterName")}
          label="Имя персонажа"
          placeholder="Имя в игре"
          {...(errors.characterName?.message ? { error: errors.characterName.message } : {})}
        />
      </div>

      <div className={classStyles.carouselContainer}>
        <button
          type="button"
          aria-label="Previous Class"
          className={classStyles.navArrow}
          onClick={handlePrev}
        >
          ‹
        </button>

        <Card
          variant="highlight"
          className={classStyles.carouselCard}
          style={
            {
              borderColor: currentClass.accentColor,
            } as React.CSSProperties
          }
        >
          <div className={classStyles.classIcon} key={`icon-${currentClass.id}`}>
            {currentClass.avatarIcon}
          </div>
          <div className={classStyles.cardContent} key={`text-${currentClass.id}`}>
            <h3 className={classStyles.className}>{currentClass.name}</h3>
            <p className={classStyles.classMotto} style={{ color: currentClass.accentColor }}>
              «{currentClass.motto}»
            </p>
            <p className={classStyles.classDescription}>{currentClass.description}</p>
          </div>
        </Card>

        <button
          type="button"
          aria-label="Next Class"
          className={classStyles.navArrow}
          onClick={handleNextClass}
        >
          ›
        </button>
      </div>

      {errors.classId && <span className={styles.error}>{errors.classId.message}</span>}

      <div className={styles.actions}>
        <Button variant="secondary" onClick={onBack}>
          Назад
        </Button>
        <Button
          fullWidth
          onClick={handleSelect}
          style={{
            backgroundColor: currentClass.accentColor,
            borderColor: currentClass.accentColor,
          }}
        >
          ВЫБРАТЬ
        </Button>
      </div>
    </div>
  );
}
