import { configureStore } from "@reduxjs/toolkit";
import { clientDataReducer } from "../features/admin/clientManagementSlice";
import { freelancerDataReducer } from "../features/admin/freelancerManagementSlice";
import { contactDataReducer } from "../features/admin/contactUsManagementSlice";
import { siteAnalyticsReducer } from "../features/admin/siteAnalyticsSlice";
const store = configureStore({
  reducer: {
    clientDataReducer: clientDataReducer,
    freelancerDataReducer:freelancerDataReducer,
    contactDataReducer:contactDataReducer,
    siteAnalyticsReducer:siteAnalyticsReducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
