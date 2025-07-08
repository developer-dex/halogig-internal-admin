import { configureStore } from "@reduxjs/toolkit";
import { clientDataReducer } from "../features/admin/clientManagementSlice";
import { freelancerDataReducer } from "../features/admin/freelancerManagementSlice";
import { contactDataReducer } from "../features/admin/contactUsManagementSlice";
import { siteAnalyticsReducer } from "../features/admin/siteAnalyticsSlice";
import { chatManagementReducer } from "../features/admin/chatManagementSlice";
import { loginDataReducer } from "../features/auth/loginSlice";

const store = configureStore({
  reducer: {
    clientDataReducer: clientDataReducer,
    freelancerDataReducer:freelancerDataReducer,
    contactDataReducer:contactDataReducer,
    siteAnalyticsReducer:siteAnalyticsReducer,
    chatManagementReducer:chatManagementReducer,
    loginDataReducer:loginDataReducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
