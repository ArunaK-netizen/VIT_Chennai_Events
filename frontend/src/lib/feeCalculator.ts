import type { Event } from '../types';

export const calculateFee = (event: Event, teamSize: number): number => {
    if (event.feePerPerson) {
        return event.feePerPerson * teamSize;
    }

    if (event.feeStructure) {
        if (event.feeStructure[teamSize.toString()]) {
            return event.feeStructure[teamSize.toString()];
        }
        // Fallback or logic for max team size fees if not explicitly defined
        // For now returning base fee if structure exists but size not found (simplified)
        return event.fee;
    }

    return event.fee;
};
