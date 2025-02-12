import { configureStore } from "@reduxjs/toolkit";
import { clientDataReducer } from "../features/admin/clientManagementSlice";
import { freelancerDataReducer } from "../features/admin/freelancerManagementSlice";

const store = configureStore({
  reducer: {
    clientData: clientDataReducer,
    freelancerDataReducer:freelancerDataReducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
