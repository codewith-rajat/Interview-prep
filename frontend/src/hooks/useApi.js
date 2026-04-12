// frontend/src/hooks/useApi.js - Reusable API hook
import { useState, useCallback } from "react";
import axios from "axios";

export const useApi = (url, method = "GET", initialData = null) => {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const request = useCallback(
    async (payload = null, options = {}) => {
      try {
        setLoading(true);
        setError("");
        const token = localStorage.getItem("token");
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
            ...options.headers,
          },
          ...options,
        };

        let response;
        switch (method.toUpperCase()) {
          case "POST":
            response = await axios.post(url, payload, config);
            break;
          case "PUT":
            response = await axios.put(url, payload, config);
            break;
          case "PATCH":
            response = await axios.patch(url, payload, config);
            break;
          case "DELETE":
            response = await axios.delete(url, config);
            break;
          default:
            response = await axios.get(url, config);
        }

        setData(response.data);
        return response.data;
      } catch (err) {
        const errorMsg = err.response?.data?.message || err.message;
        setError(errorMsg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [url, method]
  );

  const reset = useCallback(() => {
    setData(initialData);
    setError("");
  }, [initialData]);

  return { data, loading, error, request, reset };
};
