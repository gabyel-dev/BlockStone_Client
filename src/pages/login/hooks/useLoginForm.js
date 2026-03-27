import { useMemo, useState } from "react";
import { loginUser } from "../../../api/auth";

export const useLoginForm = () => {
  const [form, setForm] = useState({ username: "", password: "" });
  const [status, setStatus] = useState({ loading: false, server: "" });

  const canSubmit = useMemo(() => {
    return (
      form.username.trim().length > 0 &&
      form.password.trim().length > 0 &&
      !status.loading
    );
  }, [form, status.loading]);

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setStatus({ loading: true, server: "" });

    try {
      await loginUser({
        username: form.username.trim(),
        password: form.password,
      });
      window.dispatchEvent(new Event("auth:changed"));
      setForm({ username: "", password: "" });
      setStatus({ loading: false, server: "" });
    } catch (error) {
      setStatus({
        loading: false,
        server: error?.response?.data?.message || "Unable to login",
      });
    }
  };

  return {
    form,
    status,
    canSubmit,
    onChange,
    submit,
  };
};
