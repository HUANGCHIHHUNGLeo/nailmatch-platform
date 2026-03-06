"use client";

import { useState, useCallback, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { serviceRequestSchema, type ServiceRequestFormData } from "@/lib/utils/form-schema";
import { hasNailServices } from "@/lib/utils/constants";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LocationStep } from "./LocationStep";
import { ServiceStep } from "./ServiceStep";
import { ProfileStep } from "./ProfileStep";
import { NailLengthStep } from "./NailLengthStep";
import { StyleStep } from "./StyleStep";
import { ScheduleStep } from "./ScheduleStep";
import { ArtistPrefStep } from "./ArtistPrefStep";
import { BudgetStep } from "./BudgetStep";
import { RemovalStep } from "./RemovalStep";
import { ReferenceStep } from "./ReferenceStep";
import { PaymentStep } from "./PaymentStep";
import { NotesStep } from "./NotesStep";
import { ContactStep } from "./ContactStep";
import { ConsentStep } from "./ConsentStep";

interface StepDef {
  component: React.ComponentType;
  title: string;
  key: string;
  extraKeys?: string[];
  skipWhen?: string;
}

const STEPS: StepDef[] = [
  { component: LocationStep, title: "服務地點", key: "locations" },
  { component: ServiceStep, title: "服務項目", key: "services" },
  { component: ProfileStep, title: "您的性別", key: "customerGender" },
  { component: NailLengthStep, title: "指甲長度", key: "nailLength", skipWhen: "no_nail" },
  { component: StyleStep, title: "偏好風格", key: "preferredStyles" },
  { component: ScheduleStep, title: "預約時間", key: "preferredDate", extraKeys: ["preferredTime"] },
  { component: ArtistPrefStep, title: "設計師偏好", key: "artistGenderPref" },
  { component: BudgetStep, title: "預算範圍", key: "budgetRange" },
  { component: RemovalStep, title: "卸除需求", key: "needsRemoval" },
  { component: PaymentStep, title: "付款方式", key: "paymentPreference" },
  { component: ReferenceStep, title: "參考圖片", key: "referenceImages" },
  { component: NotesStep, title: "補充需求", key: "additionalNotes" },
  { component: ContactStep, title: "聯絡資訊", key: "customerName", extraKeys: ["customerPhone"] },
  { component: ConsentStep, title: "確認送出", key: "consentAccepted" },
];

interface PrefillArtist {
  id: string;
  display_name: string;
  avatar_url: string | null;
  cities: string[];
  services: string[];
  styles: string[];
  min_price: number | null;
  max_price: number | null;
}

interface MultiStepFormProps {
  onSubmit: (data: ServiceRequestFormData) => Promise<void>;
  prefillArtist?: PrefillArtist;
}

export function MultiStepForm({ onSubmit, prefillArtist }: MultiStepFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const methods = useForm<ServiceRequestFormData>({
    resolver: zodResolver(serviceRequestSchema),
    defaultValues: {
      locations: prefillArtist?.cities ?? [],
      services: prefillArtist?.services ?? [],
      customerGender: "",
      nailLength: "",
      preferredStyles: prefillArtist?.styles ?? [],
      preferredDate: "",
      preferredDateCustom: "",
      preferredTime: "",
      artistGenderPref: "",
      budgetRange: "",
      needsRemoval: "",
      paymentPreference: [],
      referenceImages: [],
      additionalNotes: "",
      customerName: "",
      customerPhone: "",
      consentAccepted: false,
    },
    mode: "onChange",
  });

  // When prefillArtist arrives async, update form values
  useEffect(() => {
    if (!prefillArtist) return;
    const current = methods.getValues();
    if (current.locations.length === 0 && (prefillArtist.cities?.length ?? 0) > 0) {
      methods.setValue("locations", prefillArtist.cities);
    }
    if (current.services.length === 0 && (prefillArtist.services?.length ?? 0) > 0) {
      methods.setValue("services", prefillArtist.services);
    }
    if (current.preferredStyles.length === 0 && (prefillArtist.styles?.length ?? 0) > 0) {
      methods.setValue("preferredStyles", prefillArtist.styles);
    }
  }, [prefillArtist, methods]);

  // Check if a step should be skipped based on current form data
  const shouldSkipStep = useCallback(
    (stepIndex: number) => {
      const step = STEPS[stepIndex];
      if (step.skipWhen === "no_nail") {
        const services = methods.getValues("services") || [];
        return !hasNailServices(services);
      }
      // Auto-skip steps that are pre-filled from the selected artist
      if (prefillArtist) {
        if (step.key === "locations" && (prefillArtist.cities?.length ?? 0) > 0) return true;
        if (step.key === "services" && (prefillArtist.services?.length ?? 0) > 0) return true;
        if (step.key === "preferredStyles" && (prefillArtist.styles?.length ?? 0) > 0) return true;
      }
      return false;
    },
    [methods, prefillArtist]
  );

  const getNextStep = useCallback(
    (from: number) => {
      let next = from + 1;
      while (next < STEPS.length && shouldSkipStep(next)) {
        next++;
      }
      return next;
    },
    [shouldSkipStep]
  );

  const getPrevStep = useCallback(
    (from: number) => {
      let prev = from - 1;
      while (prev >= 0 && shouldSkipStep(prev)) {
        prev--;
      }
      return prev;
    },
    [shouldSkipStep]
  );

  // Count visible steps for progress
  const visibleSteps = STEPS.filter((_, i) => !shouldSkipStep(i));
  const visibleIndex = visibleSteps.indexOf(STEPS[currentStep]);
  const progress = ((visibleIndex + 1) / visibleSteps.length) * 100;
  const isLastStep = getNextStep(currentStep) >= STEPS.length;
  const CurrentStepComponent = STEPS[currentStep].component;

  const handleNext = async () => {
    const step = STEPS[currentStep];
    const stepKey = step.key as keyof ServiceRequestFormData;

    // Determine which fields to validate
    const fieldsToValidate: (keyof ServiceRequestFormData)[] = [stepKey];
    if (step.extraKeys) {
      fieldsToValidate.push(...(step.extraKeys as (keyof ServiceRequestFormData)[]));
    }

    // Optional steps skip validation
    const isOptional = stepKey === "referenceImages" || stepKey === "additionalNotes" || stepKey === "nailLength" || stepKey === "paymentPreference" || stepKey === "customerPhone";
    const isValid = isOptional || (await methods.trigger(fieldsToValidate));

    if (isValid) {
      if (isLastStep) {
        setIsSubmitting(true);
        try {
          await methods.handleSubmit(
            onSubmit,
            (errors) => {
              console.error("Form validation errors:", errors);
              const firstError = Object.values(errors)[0];
              if (firstError?.message) {
                alert(`表單驗證失敗：${firstError.message}`);
              }
            }
          )();
        } catch (err) {
          console.error("Submit error:", err);
        } finally {
          setIsSubmitting(false);
        }
      } else {
        setCurrentStep(getNextStep(currentStep));
      }
    }
  };

  const handleBack = () => {
    const prev = getPrevStep(currentStep);
    if (prev >= 0) {
      setCurrentStep(prev);
    }
  };

  return (
    <FormProvider {...methods}>
      <div className="mx-auto max-w-lg">
        {/* Artist Info Banner */}
        {prefillArtist && (
          <div className="mb-4 flex items-center gap-3 rounded-xl border border-[var(--brand-light)] bg-white p-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={prefillArtist.avatar_url || undefined} />
              <AvatarFallback className="bg-[var(--brand-light)] text-sm text-[var(--brand-dark)]">
                {prefillArtist.display_name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-gray-900">
                指定預約：{prefillArtist.display_name}
              </p>
              <p className="text-xs text-gray-500">
                {(prefillArtist.services || []).slice(0, 3).join("、")}
                {(prefillArtist.services || []).length > 3 && ` 等${prefillArtist.services.length}項`}
                {prefillArtist.min_price != null && ` · NT$${prefillArtist.min_price.toLocaleString()} 起`}
              </p>
            </div>
          </div>
        )}

        {/* Progress */}
        <div className="mb-2 flex items-center justify-between text-sm text-gray-500">
          <span>
            {visibleIndex + 1} / {visibleSteps.length}
          </span>
          <span>{STEPS[currentStep].title}</span>
        </div>
        <Progress value={progress} className="mb-8 h-2" />

        {/* Step Content */}
        <div className="min-h-[300px]">
          <CurrentStepComponent />
        </div>

        {/* Navigation */}
        <div className="mt-8 flex justify-between gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0}
            className="flex-1"
          >
            上一步
          </Button>
          <Button
            type="button"
            onClick={handleNext}
            disabled={isSubmitting}
            className="flex-1 bg-[var(--brand)] hover:bg-[var(--brand-dark)]"
          >
            {isSubmitting
              ? "送出中..."
              : isLastStep
                ? "送出需求"
                : "下一步"}
          </Button>
        </div>
      </div>
    </FormProvider>
  );
}
