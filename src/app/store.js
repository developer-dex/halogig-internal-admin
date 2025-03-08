import { configureStore } from "@reduxjs/toolkit";
import { clientDataReducer } from "../features/admin/clientManagementSlice";
import { freelancerDataReducer } from "../features/admin/freelancerManagementSlice";
import { contactDataReducer } from "../features/admin/contactUsManagementSlice";

const store = configureStore({
  reducer: {
    clientDataReducer: clientDataReducer,
    freelancerDataReducer:freelancerDataReducer,
    contactDataReducer:contactDataReducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
