import { useMemo } from "react";

type DailyAvatarConfig = {
    key: string;          // clé unique (ex: "chatbot-avatar")
    values: string[];     // liste des avatars
};

export function useDailyAvatar({ key, values }: DailyAvatarConfig) {
    return useMemo(() => {
        if (typeof window === "undefined") return values[0];

        const today = new Date().toISOString().split("T")[0];
        const dateKey = `${key}-date`;
        const valueKey = `${key}-value`;

        const storedDate = localStorage.getItem(dateKey);
        const storedValue = localStorage.getItem(valueKey);

        if (storedDate === today && storedValue) {
            return storedValue;
        }

        const newValue = values[Math.floor(Math.random() * values.length)];
        localStorage.setItem(dateKey, today);
        localStorage.setItem(valueKey, newValue);

        return newValue;
    }, [key, values]);
}
