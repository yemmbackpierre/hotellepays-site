import { useCallback, useSyncExternalStore } from "react";

type DailyAvatarConfig = {
    key: string;          // clé unique (ex: "chatbot-avatar")
    values: string[];     // liste des avatars
};

const subscribe = (callback: () => void) => {
    window.addEventListener("storage", callback);
    return () => window.removeEventListener("storage", callback);
};

export function useDailyAvatar({ key, values }: DailyAvatarConfig) {
    const getServerSnapshot = useCallback(() => values[0], [values]);

    const getSnapshot = useCallback(() => {
        if (values.length === 0) return "";
        try {
            const today = new Date().toISOString().split("T")[0];
            const dateKey = `${key}-date`;
            const valueKey = `${key}-value`;

            const storedDate = localStorage.getItem(dateKey);
            const storedValue = localStorage.getItem(valueKey);

            if (storedDate === today && storedValue && values.includes(storedValue)) {
                return storedValue;
            }

            const newValue = values[Math.floor(Math.random() * values.length)];
            localStorage.setItem(dateKey, today);
            localStorage.setItem(valueKey, newValue);
            return newValue;
        } catch {
            return values[0];
        }
    }, [key, values]);

    return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
