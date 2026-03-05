"use client";

import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { serviceRequestSchema, type ServiceRequestFormData } from "@/lib/utils/form-schema";
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
import { NotesStep } from "./NotesStep";

const STEPS = [
  { component: LocationStep, title: "服務地點", key: "locations" },
  { component: ServiceStep, title: "服務項目", key: "services" },
  { component: ProfileStep, title: "您的性別", key: "customerGender" },
  { component: NailLengthStep, title: "指甲長度", key: "nailLength" },
  { component: StyleStep, title: "偏好風格", key: "preferredStyles" },
  { component: ScheduleStep, title: "預約時間", key: "preferredDate" },
  { component: ArtistPrefStep, title: "美甲師偏好", key: "artistGenderPref" },
  { component: BudgetStep, title: "預算範圍", key: "budgetRange" },
  { component: RemovalStep, title: "卸甲需求", key: "needsRemoval" },
  { component: ReferenceStep, title: "參考圖片", key: "referenceImages" },
  { component: NotesStep, title: "補充需求", key: "additionalNotes" },
];

interface MultiStepFormProps {
  onSubmit: (data: ServiceRequestFormData) => Promise<void>;
}

export function MultiStepForm({ onSubmit }: MultiStepFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const methods = useForm<ServiceRequestFormData>({
    resolver: zodResolver(serviceRequestSchema),
    defaultValues: {
      locations: [],
      services: [],
      customerGender: "",
      nailLength: "",
      preferredStyles: [],
      preferredDate: "",
      preferredDateCustom: "",
      artistGenderPref: "",
      budgetRange: "",
      needsRemoval: "",
      referenceImages: [],
      additionalNotes: "",
    },
    mode: "onChange",
  });

  const progress = ((currentStep + 1) / STEPS.length) * 100;
  const isLastStep = currentStep === STEPS.length - 1;
  const CurrentStepComponent = STEPS[currentStep].component;

  const handleNext = async () => {
    // Validate current step field
    const stepKey = STEPS[currentStep].key as keyof ServiceRequestFormData;
    const isValid = await methods.trigger(stepKey);

    // Allow optional steps (referenceImages, additionalNotes) to pass
    if (currentStep >= 9 || isValid) {
      if (isLastStep) {
        setIsSubmitting(true);
        try {
          await methods.handleSubmit(onSubmit)();
        } finally {
          setIsSubmitting(false);
        }
      } else {
        setCurrentStep((prev) => prev + 1);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <FormProvider {...methods}>
      <div className="mx-auto max-w-lg">
        {/* Progress */}
        <div className="mb-2 flex items-center justify-between text-sm text-gray-500">
          <span>
            {currentStep + 1} / {STEPS.length}
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
            className="flex-1 bg-pink-500 hover:bg-pink-600"
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
