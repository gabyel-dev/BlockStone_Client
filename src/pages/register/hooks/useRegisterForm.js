import { useMemo, useState } from "react";
import { registerUser } from "../../../api/auth";

export const useRegisterForm = () => {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({
    loading: false,
    success: "",
    server: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const canSubmit = useMemo(() => {
    const requiredValues = [
      form.first_name.trim(),
      form.last_name.trim(),
      form.username.trim(),
      form.email.trim(),
      form.password.trim(),
    ];

    return requiredValues.every((value) => value.length > 0) && !status.loading;
  }, [form, status.loading]);

  const onFieldChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setStatus({ loading: true, success: "", server: "" });

    try {
      await registerUser({
        ...form,
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        username: form.username.trim(),
        email: form.email.trim().toLowerCase(),
      });

      setStatus({
        loading: false,
        success: "Account created successfully.",
        server: "",
      });
      setErrors({});
      setForm({
        first_name: "",
        last_name: "",
        username: "",
        email: "",
        password: "",
      });
    } catch (error) {
      setErrors(error?.response?.data?.errors ?? {});
      setStatus({
        loading: false,
        success: "",
        server:
          error?.response?.data?.message ||
          "Unable to create account. Please try again.",
      });
    }
  };

  return {
    form,
    errors,
    status,
    canSubmit,
    showPassword,
    setShowPassword,
    onFieldChange,
    onSubmit,
  };
};
