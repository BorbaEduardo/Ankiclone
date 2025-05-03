import { ReviewData } from "@/types";

// Constants for SM-2 algorithm
const MIN_EASE_FACTOR = 1.3;
const INITIAL_EASE_FACTOR = 2.5;

/**
 * Calculates the next review state based on the SM-2 algorithm.
 *
 * @param review The current review data for the card.
 * @param quality The quality of the response (0-5 scale):
 *                0: "Complete blackout"
 *                1: "Incorrect response; the correct one remembered"
 *                2: "Incorrect response; where the correct one seemed easy to recall"
 *                3: "Correct response recalled with serious difficulty"
 *                4: "Correct response after a hesitation"
 *                5: "Perfect response"
 * @returns Partial<ReviewData> An object containing the updated fields for the review record:
 *                due_date, interval, ease_factor, repetitions.
 */
export const updateReviewData = (
    review: ReviewData,
    quality: number
): Pick<ReviewData, 'due_date' | 'interval' | 'ease_factor' | 'repetitions'> => {

    let newInterval: number;
    let newEaseFactor: number = review.ease_factor;
    let newRepetitions: number = review.repetitions;

    // Ensure quality is within the valid range
    const q = Math.max(0, Math.min(5, quality));

    if (q < 3) {
        // Incorrect response: Reset repetitions and interval (start over)
        newRepetitions = 0;
        newInterval = 1; // Reset interval to 1 day
        // Ease factor is not reset according to the original SM-2 pseudocode when q < 3
        // Some implementations might decrease it here, e.g., newEaseFactor = Math.max(MIN_EASE_FACTOR, newEaseFactor - 0.20);
    } else {
        // Correct response: Update ease factor and calculate next interval
        newRepetitions += 1;

        // Update ease factor
        newEaseFactor = newEaseFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
        if (newEaseFactor < MIN_EASE_FACTOR) {
            newEaseFactor = MIN_EASE_FACTOR;
        }

        // Calculate new interval based on repetitions
        if (newRepetitions === 1) {
            newInterval = 1;
        } else if (newRepetitions === 2) {
            newInterval = 6;
        } else {
            // Use the interval from the *previous* successful review
            newInterval = Math.round(review.interval * newEaseFactor);
        }
    }

    // Calculate the next due date
    const now = new Date();
    const dueDate = new Date(now.setDate(now.getDate() + newInterval));

    return {
        due_date: dueDate.toISOString(),
        interval: newInterval,
        ease_factor: newEaseFactor,
        repetitions: newRepetitions,
    };
};

/**
 * Gets the initial review data for a new card.
 */
export const getInitialReviewData = (): Pick<ReviewData, 'due_date' | 'interval' | 'ease_factor' | 'repetitions'> => {
    const now = new Date();
    return {
        due_date: now.toISOString(), // Due immediately
        interval: 0,
        ease_factor: INITIAL_EASE_FACTOR,
        repetitions: 0,
    };
};

