"use client";

import React, { useState } from "react";
import { OnboardingModal } from "./onboarding-modal";

export function OnboardingWrapper({ initiallyOpen }: { initiallyOpen: boolean }) {
    const [isOpen, setIsOpen] = useState(initiallyOpen);

    return (
        <OnboardingModal
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
        />
    );
}
