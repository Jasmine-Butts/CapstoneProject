import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../services/AuthContext";
import { getRecommendations } from "../components/BookRecommendations";

export function useRecommendations() {

    const { token } = useAuth();

    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchRecommendations = useCallback(async (signal) => {
        if (!token) {
            setRecommendations([]);
            setLoading(false);
            setError(null);

            return;
        }

        setLoading(true);
        setError(null);

        try {
            const data = await getRecommendations(token, signal);

            if (signal?.aborted) return;

            setRecommendations(data);
        } catch (err) {
            if (signal?.aborted || err.name === "AbortError") {
                return;
            }

            setError(err.message);

        } finally {
            if (!signal?.aborted) {
                setLoading(false);
            }
        }
        }, [token]
    );

    useEffect(() => {
        const controller = new AbortController();

        fetchRecommendations(controller.signal);

        return () => controller.abort();
    }, [fetchRecommendations]);

    const refreshRecommendations = useCallback(() => 
        fetchRecommendations(), [fetchRecommendations]
    );

    return {
        recommendations,
        loading,
        error,
        refreshRecommendations
    }





}