import { supabase } from "@/shared/api/supabase/client";
import { getLocalDateString } from "@/shared/lib/localDate";

import type { OnboardingFormValues } from "../model/schema";

export interface CompleteOnboardingResult {
  character_id: string;
}

export const onboardingRepository = {
  async complete(data: OnboardingFormValues): Promise<CompleteOnboardingResult> {
    const { data: result, error } = await supabase.rpc("complete_onboarding", {
      p_username: data.username,
      p_character_name: data.characterName,
      p_class_id: data.classId,
      p_starting_directions: data.startingDirections,
      // the first character snapshot is dated with the user's local day
      p_local_date: getLocalDateString(),
    });

    if (error) {
      throw new Error(error.message);
    }

    return result as unknown as CompleteOnboardingResult;
  },
};
