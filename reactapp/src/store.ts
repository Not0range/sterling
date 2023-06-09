import { createSlice, configureStore, PayloadAction } from '@reduxjs/toolkit'
import { Profile } from './models/Profile';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import { Category } from './models/Product';

const mainSlice = createSlice({
    name: 'main',
    initialState: {
        profile: null,
        notifications: [],
        categories: []
    } as IState,
    reducers: {
        setProfile: (state, action: PayloadAction<Profile | null>) => {
            state.profile = action.payload;
        },
        pushNotification: (state, action: PayloadAction<Notification>) => {
            state.notifications.push(action.payload);
        },
        setCategories: (state, action: PayloadAction<Category[]>) => {
            state.categories = action.payload;
        }
    }
});

interface Notification {
    text: string;
    type: 'success' | 'danger' | 'warning' | 'info';
}

interface IState {
    profile: Profile | null;
    notifications: Notification[];
    categories: Category[];
}

export const store = configureStore({
    reducer: {
        main: mainSlice.reducer
    }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export const useAppDispatch: () => AppDispatch = useDispatch;

export const { setProfile, pushNotification, setCategories } = mainSlice.actions;