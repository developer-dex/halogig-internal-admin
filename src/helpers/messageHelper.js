import { toast } from "react-toastify";

/**
 * This function is used to show success message
 * @param {*} _text
 */
export function showSuccess(_text) {
  toast.success(_text, { className: "success-toast" });
}

/**
 * This function is used to show error alert
 * @param {*} _text
 */
export function showError(_text) {
  toast.error(_text, { className: "error-toast" });
}

/**
 * This function is used to this show info alert
 * @param {*} _text
 */
export function showInfo(_text) {
  toast.info(_text, { className: "info-toast" });
}

/**
 * This function is used to this show info alert
 * @param {*} _text
 */
export function showWarning(_text) {
  toast.warning(_text, { className: "warning-toast" });
}