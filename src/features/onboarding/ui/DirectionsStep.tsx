import type { UseFormReturn } from "react-hook-form";

import { characterClasses, startingDirections } from "@/entities/character/model/classes";
import type { StartingDirectionId } from "@/entities/character/model/types";
import { Badge } from "@/shared/ui/Badge/ui/Badge";
import { Button } from "@/shared/ui/Button/ui/Button";

import type { OnboardingFormValues } from "../model/schema";
import directionsStyles from "./DirectionsStep.module.css";
import styles from "./StepLayout.module.css";

interface DirectionsStepProps {
  form: UseFormReturn<OnboardingFormValues, object, OnboardingFormValues>;
  onNext: () => void;
  onBack: () => void;
}

export function DirectionsStep({ form, onNext, onBack }: DirectionsStepProps) {
  const {
    watch,
    setValue,
    formState: { errors },
  } = form;

  const selected = watch("startingDirections") ?? [];
  const selectedClassId = watch("classId");
  const selectedClass = characterClasses.find((c) => c.id === selectedClassId);
  const accentColor = selectedClass?.accentColor ?? "var(--color-primary)";

  const toggleDirection = (id: StartingDirectionId) => {
    const next = selected.includes(id) ? selected.filter((item) => item !== id) : [...selected, id];

    setValue("startingDirections", next, { shouldValidate: true });
  };

  return (
    <div className={styles.step}>
      <h2 className={styles.title}>CHOOSE YOUR DOMAINS</h2>

      <div className={directionsStyles.arena}>
        <div className={directionsStyles.centerHero} style={{ borderColor: accentColor }}>
          {selectedClass?.avatarIcon ?? "⚔️"}
        </div>

        <div className={directionsStyles.domainCluster}>
          {startingDirections.map((direction) => {
            const isSelected = selected.includes(direction.id);

            return (
              <Badge
                key={direction.id}
                variant={isSelected ? "primary" : "default"}
                className={`${directionsStyles.chip} ${isSelected ? directionsStyles.selectedChip : ""}`}
                onClick={() => toggleDirection(direction.id)}
                role="button"
                tabIndex={0}
                style={
                  isSelected
                    ? ({
                        backgroundColor: accentColor,
                        borderColor: accentColor,
                      } as React.CSSProperties)
                    : undefined
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    toggleDirection(direction.id);
                  }
                }}
              >
                {direction.label} {isSelected && "✓"}
              </Badge>
            );
          })}
        </div>
      </div>

      {errors.startingDirections && (
        <span className={styles.error}>{errors.startingDirections.message}</span>
      )}

      <div className={styles.actions}>
        <Button variant="secondary" onClick={onBack}>
          Назад
        </Button>
        <Button fullWidth onClick={onNext}>
          Далее
        </Button>
      </div>
    </div>
  );
}
